import { Text } from '../../Base/components/Text';
import { Box } from 'grommet';
import * as React from 'react';
import { UserStoreEx } from '../../../stores/UserStore';
import { Button } from 'semantic-ui-react';
import SoftTitleValue from '../SoftTitleValue';
import { useState } from 'react';
//import { observer } from 'mobx-react-lite';

const UnlockToken = (props: {
  userStore: UserStoreEx;
  tokenAddress: string;
  selected: boolean;
  showSubTitle: boolean;
  pulseInterval: number;
  title: string;
  subtitle: string;
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Box direction="row">
      <Button
        loading={loading}
        onClick={async () => {
          setLoading(true);
          try {
            await props.userStore.keplrWallet.suggestToken(
              props.userStore.chainId,
              props.tokenAddress,
            );
            await props.userStore.updateBalanceForSymbol(
              null,
              props.tokenAddress,
            );
          } catch (error) {
            error => console.error(error);
          }
          setLoading(false);
          clearInterval(props.pulseInterval);
        }}
        style={{
          display: 'flex',
          borderRadius: '15px',
          fontSize: '1rem',
          fontWeight: 500,
          height: 'auto',
          padding: '0.5rem 0.3rem',
          background: 'transparent',
        }}
      >
        <span
          role="img"
          aria-label={'lock'}
          style={{
            display: 'inline-block',
            fontSize: '20px',
            backgroundColor: '#e0e1e2',
            borderRadius: '50%',
            padding: '8px',
            verticalAlign: 'middle',
            lineHeight: '24px',
            width: '40px',
          }}
        >
          🔍
        </span>
        <SoftTitleValue
          title={'View Balance'}
          subTitle={props.showSubTitle ? props.subtitle : null}
        />
      </Button>
    </Box>
  );
};

export default UnlockToken;
