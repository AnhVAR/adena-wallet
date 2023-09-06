import React, { useEffect, useState } from 'react';
import { ApproveInjectionLoadingWrapper } from './approve-injection-loading.styles';
import Spinner from '@components/spinner/spinner';

export interface ApproveInjectionLoadingProps {
  wait?: number;
  timeout?: number;
  done: boolean;
  onResponse: () => void;
  onTimeout: () => void;
}

const INTERVAL_DURATION = 500;

const ApproveInjectionLoading: React.FC<ApproveInjectionLoadingProps> = ({
  wait = 1000,
  timeout = 5000,
  done,
  onResponse,
  onTimeout,
}) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(tick + INTERVAL_DURATION);
    }, INTERVAL_DURATION);

    if (done && onResponse) {
      if (tick > wait) {
        onResponse();
        clearInterval(interval);
        return;
      }
    }

    if (tick > timeout) {
      onTimeout();
      clearInterval(interval);
      return;
    }

    return () => clearInterval(interval);
  }, [tick, done, onResponse]);

  return (
    <ApproveInjectionLoadingWrapper>
      <Spinner />
      <span className='description'>Processing Request...</span>
    </ApproveInjectionLoadingWrapper>
  );
};

export default ApproveInjectionLoading;