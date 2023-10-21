import { InjectionMessage, InjectionMessageInstance, MessageKeyType } from '../message';
import { v4 as uuidv4 } from 'uuid';
import {
  validateDoContractRequest,
  validateTrasactionMessageOfAddPkg,
  validateTrasactionMessageOfBankSend,
  validateTrasactionMessageOfRun,
  validateTrasactionMessageOfVmCall,
} from '@common/validation/validation-message';

type Params = { [key in string]: any };

export interface RequestAddedNetworkMessage {
  chainId: string;
  chainName: string;
  rpcUrl: string;
}

export interface RequestDocontractMessage {
  messages: Array<{
    type: string;
    value: { [key in string]: any };
  }>;
  gasFee: number;
  gasWanted: number;
  memo?: string;
}

export class AdenaExecutor {
  private eventKey;

  private isListen;

  private eventMessage: InjectionMessage | undefined;

  private resolver: ((message: unknown) => void) | undefined;

  private messages: {
    [key in string]: { request: InjectionMessage; response: InjectionMessage | undefined };
  } = {};

  private static instance: AdenaExecutor | undefined = new AdenaExecutor();

  constructor() {
    this.eventKey = uuidv4();
    this.isListen = false;
  }

  public static getInstance = (): AdenaExecutor => {
    if (!AdenaExecutor.instance) {
      AdenaExecutor.instance = new AdenaExecutor();
    }
    if (!AdenaExecutor.instance.isListen) {
      AdenaExecutor.instance.listen();
    }
    return AdenaExecutor.instance;
  };

  public addEstablish = (name?: string) => {
    const eventMessage = AdenaExecutor.createEventMessage('ADD_ESTABLISH', {
      name: name ?? 'Unknown',
    });
    return this.sendEventMessage(eventMessage);
  };

  public doContract = (params: RequestDocontractMessage) => {
    const result = this.valdiateContractMessage(params);
    if (result) {
      return this.sendEventMessage(result);
    }
    const eventMessage = AdenaExecutor.createEventMessage('DO_CONTRACT', params);
    return this.sendEventMessage(eventMessage);
  };

  public getAccount = () => {
    const eventMessage = AdenaExecutor.createEventMessage('GET_ACCOUNT');
    return this.sendEventMessage(eventMessage);
  };

  public signAmino = (params: RequestDocontractMessage) => {
    const result = this.valdiateContractMessage(params);
    if (result) {
      return this.sendEventMessage(result);
    }
    const eventMessage = AdenaExecutor.createEventMessage('SIGN_AMINO', params);
    return this.sendEventMessage(eventMessage);
  };

  public makeTx = (params: RequestDocontractMessage) => {
    const result = this.valdiateContractMessage(params);
    if (result) {
      return this.sendEventMessage(result);
    }
    const eventMessage = AdenaExecutor.createEventMessage('MAKE_TX', params);
    return this.sendEventMessage(eventMessage);
  };

  public addNetwork = (chain: RequestAddedNetworkMessage) => {
    const eventMessage = AdenaExecutor.createEventMessage('ADD_NETWORK', { ...chain });
    return this.sendEventMessage(eventMessage);
  };

  public switchNetwork = (chainId: string) => {
    const eventMessage = AdenaExecutor.createEventMessage('SWITCH_NETWORK', { chainId });
    return this.sendEventMessage(eventMessage);
  };

  private valdiateContractMessage = (params: RequestDocontractMessage) => {
    if (!validateDoContractRequest(params)) {
      return InjectionMessageInstance.failure('INVALID_FORMAT');
    }
    for (const message of params.messages) {
      switch (message.type) {
        case '/bank.MsgSend':
          if (!validateTrasactionMessageOfBankSend(message)) {
            return InjectionMessageInstance.failure('INVALID_FORMAT');
          }
          break;
        case '/vm.m_call':
          if (!validateTrasactionMessageOfVmCall(message)) {
            return InjectionMessageInstance.failure('INVALID_FORMAT');
          }
          break;
        case '/vm.m_addpkg':
          if (!validateTrasactionMessageOfAddPkg(message)) {
            return InjectionMessageInstance.failure('INVALID_FORMAT');
          }
          break;
        case '/vm.m_run':
          if (!validateTrasactionMessageOfRun(message)) {
            return InjectionMessageInstance.failure('INVALID_FORMAT');
          }
          break;
        default:
          return InjectionMessageInstance.failure('UNSUPPORTED_TYPE');
      }
    }
  };

  private sendEventMessage = (eventMessage: InjectionMessage) => {
    this.listen();
    this.eventMessage = {
      ...eventMessage,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      key: this.eventKey,
    };
    window.postMessage(this.eventMessage, '*');
    this.messages[this.eventKey] = {
      request: this.eventMessage,
      response: undefined,
    };

    return new Promise((resolver) => {
      this.resolver = resolver;
    }).finally(() => this.unlisten());
  };

  private listen = () => {
    if (this.isListen) {
      return;
    }
    this.isListen = true;
    window.addEventListener('message', this.messageHandler, true);
  };

  public unlisten = () => {
    this.isListen = false;
    window.removeEventListener('message', this.messageHandler, true);
  };

  private static createEventMessage = (type: MessageKeyType, params?: Params) => {
    return InjectionMessageInstance.request(type, params);
  };

  private messageHandler = (event: MessageEvent<InjectionMessage | any>) => {
    const eventData = event.data;
    if (eventData.status) {
      const { key, status, data, code, message, type } = eventData;
      if (key === this.eventKey) {
        switch (eventData.status) {
          case 'response':
            break;
          case 'success':
            this.unlisten();
            this.resolver &&
              this.resolver({
                status,
                data,
                code,
                message,
                type,
              });
            break;
          case 'failure':
            this.unlisten();
            this.resolver &&
              this.resolver({
                status,
                data: Object.keys(data).length > 0 ? data : null,
                code,
                message,
                type,
              });
            break;
          default:
            break;
        }
      }
    }
  };
}
