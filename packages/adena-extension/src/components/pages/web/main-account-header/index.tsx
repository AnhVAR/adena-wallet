import { ReactElement, useEffect, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { Account } from 'adena-module';

import { CopyIconButton, Pressable, Row, View, WebImg, WebText } from '@components/atoms';
import { formatAddress } from '@common/utils/client-utils';
import back from '@assets/web/chevron-left.svg';

const StyledContainer = styled(Row)`
  width: 100%;
  justify-content: space-between;
`;

const StyledAccountRow = styled(Row)`
  gap: 8px;
`;

export type WebMainAccountHeaderProps = {
  account: Account | null;
  onClickGoBack: () => void;
};

export const WebMainAccountHeader = ({
  account,
  onClickGoBack,
}: WebMainAccountHeaderProps): ReactElement => {
  const theme = useTheme();
  const [address, setAddress] = useState<string>('');

  const addressStr = useMemo(() => {
    if (address === '') {
      return '';
    }
    return `(${formatAddress(address, 4)})`;
  }, [address]);

  useEffect(() => {
    if (account) {
      account.getAddress('g').then(setAddress);
    }
  }, [account]);

  return (
    <StyledContainer>
      <Pressable
        onClick={onClickGoBack}
        style={{ padding: 4, backgroundColor: theme.webInput._100, borderRadius: 16 }}
      >
        <WebImg src={back} size={24} />
      </Pressable>
      {account && (
        <StyledAccountRow>
          <WebText type='title4'>{account.name}</WebText>
          <WebText type='body4' color={theme.webNeutral._600}>{addressStr}</WebText>
          <CopyIconButton copyText={address} />
        </StyledAccountRow>
      )}
      <View />
    </StyledContainer >
  );
};
