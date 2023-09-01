import { RoutePath } from '@router/path';
import { HandlerMethod } from '..';
import { InjectionMessage, InjectionMessageInstance } from '../message';
import { InjectCore } from './core';

export const addNetwork = async (
  requestData: InjectionMessage,
  sendResponse: (message: any) => void,
) => {
  const core = new InjectCore();
  const locked = await core.walletService.isLocked();
  const datas = requestData.data;
  if (!locked) {
    const chainId = datas?.chainId || '';
    const chainName = datas?.chainName || '';
    const rpcUrl = datas?.rpcUrl || '';
    if (chainId === '' || chainName === '' || rpcUrl === '') {
      sendResponse(InjectionMessageInstance.failure('INVALID_FORMAT', {}, requestData.key));
      return;
    }
    const networks = await core.chainService.getNetworks();
    const existNetwork =
      networks.findIndex((current) => current.chainId === chainId && current.deleted !== true) > -1;
    if (existNetwork) {
      sendResponse(InjectionMessageInstance.failure('NETWORK_ALREADY_EXISTS', {}, requestData.key));
      return;
    }

    HandlerMethod.createPopup(
      RoutePath.ApproveAddingNetwork,
      requestData,
      InjectionMessageInstance.failure('ADD_NETWORK_REJECTED', {}, requestData.key),
      sendResponse,
    );
  } else {
    sendResponse(InjectionMessageInstance.failure('WALLET_LOCKED', {}, requestData.key));
  }
};

export const switchNetwork = async (
  requestData: InjectionMessage,
  sendResponse: (message: any) => void,
) => {
  const core = new InjectCore();
  const locked = await core.walletService.isLocked();
  if (locked) {
    sendResponse(InjectionMessageInstance.failure('WALLET_LOCKED', {}, requestData.key));
    return;
  }
  const chainId = requestData.data?.chainId || '';
  if (chainId === '') {
    sendResponse(InjectionMessageInstance.failure('INVALID_FORMAT', {}, requestData.key));
    return;
  }
  const currentNetwork = await core.chainService.getCurrentNetwork();
  if (currentNetwork.networkId === chainId) {
    sendResponse(
      InjectionMessageInstance.failure(
        'REDUNDANT_CHANGE_REQUEST',
        requestData?.data,
        requestData?.key,
      ),
    );
    return;
  }
  const networks = await core.chainService.getNetworks();
  const existNetwork =
    networks.findIndex((current) => current.chainId === chainId && current.deleted !== true) > -1;
  if (!existNetwork) {
    sendResponse(InjectionMessageInstance.failure('UNADDED_NETWORK', {}, requestData.key));
    return;
  }

  HandlerMethod.createPopup(
    RoutePath.ApproveChangingNetwork,
    requestData,
    InjectionMessageInstance.failure('SWITCH_NETWORK_REJECTED', {}, requestData.key),
    sendResponse,
  );
};