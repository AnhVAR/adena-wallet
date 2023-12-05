import React from 'react';
import { TokenBalanceWrapper } from './token-balance.styles';
import { FontsType } from '@styles/theme';
import HighlightNumber from '../highlight-number/highlight-number';

export interface TokenBalanceProps {
  value: string;
  denom: string;
  orientation?: 'VERTICAL' | 'HORIZONTAL';
  fontColor?: string;
  fontStyleKey?: FontsType;
  minimumFontSize?: string;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({
  value,
  denom,
  orientation = 'VERTICAL',
  fontColor = 'white',
  fontStyleKey = 'header6',
  minimumFontSize = '14px',
}) => {
  return (
    <TokenBalanceWrapper
      orientation={orientation}
      fontColor={fontColor}
      fontStyleKey={fontStyleKey}
      minimumFontSize={minimumFontSize}
    >
      <HighlightNumber
        value={value}
        fontColor={fontColor}
        fontStyleKey={fontStyleKey}
        minimumFontSize={minimumFontSize}
      />
      <div className='denom-wrapper'>
        <span className='denom'>{denom}</span>
      </div>
    </TokenBalanceWrapper>
  );
};

export default TokenBalance;