import { Text } from '../../Base/components/Text';
import { Box } from 'grommet';
import * as React from 'react';
import { UserStoreEx } from '../../../stores/UserStore';
import { Button } from 'semantic-ui-react';
//import { observer } from 'mobx-react-lite';

const UnlockToken = (props: {
  userStore: UserStoreEx;
  tokenAddress: string;
  selected: boolean;
}) => {
  return (
    <Box direction="row">
      <Button
        onClick={async () => {
          await props.userStore.keplrWallet.suggestToken(
            props.userStore.chainId,
            props.tokenAddress,
          );
          await props.userStore.updateBalanceForSymbol(
            null,
            props.tokenAddress,
          );
        }}
        style={{
          borderRadius: '15px',
          fontSize: '1rem',
          fontWeight: 500,
          height: '30px',
          padding: '0rem 0.3rem',
        }}
      >
        <span role="img" aria-label={'lock'}>
          🔓
        </span>
      </Button>
    </Box>
  );
};

export default UnlockToken;
