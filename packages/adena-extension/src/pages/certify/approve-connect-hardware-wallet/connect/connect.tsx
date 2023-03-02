import React, { useEffect, useState } from 'react';
import { Wallet, WalletAccount, LedgerConnector } from 'adena-module';
import { RoutePath } from '@router/path';
import { ConnectRequest } from './connect-request';
import { ConnectFail } from './connect-fail';
import { ConnectRequestWallet } from './connect-request-wallet';
import { useNavigate } from 'react-router-dom';
import { ConnectRequestWalletLoad } from './connect-request-wallet-load';

type ConnectType =
  'INIT' |
  'REQUEST' |
  'NOT_PERMISSION' |
  'REQUEST_WALLET' |
  'REQUEST_WALLET_LOAD' |
  'FAILED' |
  'SUCCESS';

export const ApproveConnectHardwareWalletConnect = () => {
  const navigate = useNavigate();
  const [openConnected, setOpenConnected] = useState(false);
  const [connectState, setConnectState] = useState<ConnectType>('INIT');
  const [wallet, setWallet] = useState<InstanceType<typeof Wallet>>();

  useEffect(() => {
    if (connectState === 'INIT') {
      initWallet();
      return;
    }
    if (connectState === 'SUCCESS' && wallet) {
      const serializedAccounts = wallet.getAccounts().map((account: InstanceType<typeof WalletAccount>) => account.serialize());
      navigate(RoutePath.ApproveHardwareWalletSelectAccount, { state: { accounts: serializedAccounts } });
      return;
    }
  }, [connectState, wallet]);

  const initWallet = async () => {
    setConnectState('REQUEST');
    let connected = false;
    if (!openConnected) {
      const devices = await LedgerConnector.devices();
      connected = devices.length > 0;
      setOpenConnected(connected);
    }

    if (connected) {
      setConnectState('REQUEST_WALLET');
      requestHardwareWallet();
      return;
    }

    setConnectState('NOT_PERMISSION');
  };

  const retryRequestPermission = () => {
    setConnectState('REQUEST');
    LedgerConnector.request().then(() => {
      setConnectState('REQUEST_WALLET');
      requestHardwareWallet();
    }).catch((e: any) => {
      console.log(e);
      setConnectState('NOT_PERMISSION');
    });
  };

  const checkHardwareConnect = async () => {
    const transport = await LedgerConnector.openConnected();
    if (transport === null) {
      return false;
    }

    await transport.close();
    return true;
  };

  const requestHardwareWallet = async () => {
    console.log("request");
    let retry = true;
    try {
      const connectedCosmosApp = await checkHardwareConnect();
      if (!connectedCosmosApp) {
        setConnectState('NOT_PERMISSION');
        return;
      }
    } catch (e) {
      setConnectState('NOT_PERMISSION');
    }

    try {
      setConnectState('REQUEST_WALLET_LOAD');
      const wallet = await Wallet.createByLedger([0, 1, 2, 3, 4]);
      await wallet.initAccounts();
      setWallet(wallet);
      setConnectState('SUCCESS');
      retry = false;
    } catch (e) {
      if (e instanceof Error) {
        if (e.message !== "The device is already open.") {
          console.log(e);
        }
      }
    }

    if (retry) {
      setTimeout(requestHardwareWallet, 1000);
      setConnectState('FAILED');
    }
  };

  const renderByState = () => {

    if (connectState === 'REQUEST') {
      return <ConnectRequest />
    }

    if (connectState === 'NOT_PERMISSION') {
      return <ConnectFail retry={retryRequestPermission} />
    }

    if (connectState === 'REQUEST_WALLET' || connectState === 'FAILED') {
      return <ConnectRequestWallet requestHardwareWallet={requestHardwareWallet} />
    }

    if (connectState === 'REQUEST_WALLET_LOAD') {
      return <ConnectRequestWalletLoad />
    }

    return <></>;
  };

  return renderByState();
};
