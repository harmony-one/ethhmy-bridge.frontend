import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { Button, Text } from 'components/Base';
import * as styles from './wallet-balances.styl';
import { truncateAddressString } from 'utils';
import { useStores } from '../../stores';
import { AuthWarning } from '../../components/AuthWarning';
import Loader from 'react-loader-spinner';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';

const WalletTemplate = observer((props: {
  address: string,
  symbol: string,
  amount: string,
}) => <Box direction="row" background="white" style={{ borderRadius: 4 }}>
    <Box pad="xxsmall" align="center" direction="row">
      <img className={styles.imgToken} src={"/static/wallet.svg"} />
      <Text margin={{ left: 'xxsmall' }}>{truncateAddressString(props.address, 10)}</Text>
    </Box>
    <Box pad="xxsmall" background="#DBDCE1" align="center" direction="row" style={{ borderRadius: 4 }}>
      {props.amount ? <Text bold>{props.amount}</Text> :
        <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" />}
      <Text bold margin={{ left: 'xxsmall' }}>{props.symbol}</Text>
    </Box>
  </Box>
)

export const WalletBalances = observer(() => {
  const { user, userMetamask, actionModals, exchange, tokens } = useStores();

  return (
    <Box direction="row" pad="none" align="end" style={{ minHeight: 50 }}>
      <Box margin={{ right: 'small' }}>
        {!user.isAuthorized ? <Button
          onClick={() => {
            if (!user.isKeplrWallet) {
              actionModals.open(() => <AuthWarning />, {
                title: '',
                applyText: 'Got it',
                closeText: '',
                noValidation: true,
                width: '500px',
                showOther: true,
                onApply: () => Promise.resolve(),
              });
            } else {
              user.signIn();
            }
          }}
        >
          Connect with Keplr
        </Button> : <WalletTemplate
            address={user.address}
            amount={user.balanceSCRT || ""}
            symbol="SCRT"
          />
        }
      </Box>

      <Box>
        {!userMetamask.isAuthorized ? <Button onClick={() => userMetamask.signIn(true)}>
          Connect with Metamask
        </Button> : <WalletTemplate
            address={userMetamask.ethAddress}
            amount={userMetamask.ethBalance}
            symbol="ETH"
          />
        }
      </Box>
    </Box>
  );
});
