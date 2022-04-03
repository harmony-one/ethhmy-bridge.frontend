import React, { useCallback } from 'react';
import { WalletButton } from '../../WalletButton';
import { useStores } from '../../../../stores';
import { Box } from 'grommet/components/Box';
import { Icon, Text } from '../../../../components/Base';
import { Button } from 'grommet/components/Button';
import * as s from './Destination.styl';
import { observer } from 'mobx-react';
import { truncateAddressString } from '../../../../utils';

interface MetamaskButtonProps {
  onClick: () => void;
}

const MetamaskButton: React.FC<MetamaskButtonProps> = ({ onClick }) => {
  return (
    <Button className={s.metamaskButton} onClick={onClick}>
      <Box direction="row" gap="8px" align="center">
        <Box>
          <img src="/metamask.svg" height="16" />
        </Box>
        <Text color="NWhite" size="xxsmall" lh="24px">
          MetaMask
        </Text>
        <Icon glyph="CloseCircle" />
      </Box>
    </Button>
  );
};

interface Props {}

export const Destination: React.FC<Props> = observer(() => {
  const { userMetamask } = useStores();

  const handleClickLogout = useCallback(() => {
    userMetamask.signOut();
  }, [userMetamask]);

  return (
    <Box direction="column" align="center" gap="8px">
      <Text color="NGray" size="xsmall">
        Destination address
      </Text>

      {userMetamask.isAuthorized && (
        <Text>{truncateAddressString(userMetamask.ethAddress)}</Text>
      )}

      {userMetamask.isAuthorized && (
        <MetamaskButton onClick={handleClickLogout} />
      )}

      {!userMetamask.isAuthorized && (
        <WalletButton
          onClick={() => {
            userMetamask.signIn();
          }}
          error={userMetamask.error}
        >
          <img src="/metamask.svg" style={{ marginRight: 15, height: 22 }} />
          Metamask
        </WalletButton>
      )}
    </Box>
  );
});

Destination.displayName = 'Destination';
