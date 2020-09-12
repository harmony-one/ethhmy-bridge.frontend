import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { Button, Icon, Text, Title } from 'components/Base';
import { Error } from 'ui';
import cn from 'classnames';
import * as styles from './wallet-balances.styl';
import {
  formatWithSixDecimals,
  formatWithTwoDecimals,
  ones,
  truncateAddressString,
} from 'utils';
import { useStores } from '../../stores';
import { AuthWarning } from '../../components/AuthWarning';
import { TOKEN } from '../../stores/interfaces';
// import { Routes } from '../../constants';

const AssetRow = observer<any>(props => {
  return (
    <Box
      className={cn(
        styles.walletBalancesRow,
        props.last ? '' : styles.underline,
      )}
    >
      <Box>
        <Text color={props.selected ? '#00ADE8' : null} bold={false}>
          {props.asset}
        </Text>
      </Box>

      <Box direction="column" align="end">
        <Box className={styles.priceColumn}>
          <Text color={props.selected ? '#00ADE8' : null} bold={true}>
            {props.value}
          </Text>
        </Box>
      </Box>
    </Box>
  );
});

export const WalletBalances = observer(() => {
  const { user, userMetamask, actionModals, exchange } = useStores();

  return (
    <Box
      direction="column"
      className={styles.walletBalances}
      margin={{ vertical: 'large' }}
    >
      {/*<Title>Wallet Info</Title>*/}

      <Box className={styles.container}>
        <Box direction="column" margin={{ bottom: 'large' }}>
          <Box direction="row" justify="between" margin={{ bottom: 'xsmall' }}>
            <Box direction="row" align="center">
              <img className={styles.imgToken} src="/one.svg" />
              <Title margin={{ right: 'xsmall' }}>Harmony</Title>
              <Text margin={{ top: '4px' }}>(ONE Wallet)</Text>
            </Box>
            {user.isAuthorized && (
              <Box
                onClick={() => {
                  user.signOut();
                }}
                margin={{ left: 'medium' }}
              >
                <Icon
                  glyph="Logout"
                  size="24px"
                  style={{ opacity: 0.5 }}
                  color="BlackTxt"
                />
              </Box>
            )}
          </Box>

          {user.isAuthorized ? (
            <>
              <AssetRow
                asset="Harmony Address"
                value={truncateAddressString(user.address)}
              />

              <AssetRow
                asset="Harmony ONE"
                value={formatWithTwoDecimals(ones(user.balance))}
              />

              <AssetRow
                asset="Harmony BUSD"
                value={formatWithTwoDecimals(user.hmyBUSDBalance)}
                selected={exchange.token === TOKEN.BUSD}
              />

              <AssetRow
                asset="Harmony LINK"
                value={formatWithTwoDecimals(user.hmyLINKBalance)}
                selected={exchange.token === TOKEN.LINK}
              />
            </>
          ) : (
            <Box direction="row" align="baseline" justify="start">
              <Button
                margin={{ vertical: 'medium' }}
                onClick={() => {
                  if (!user.isOneWallet) {
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
                Connect ONE Wallet
              </Button>
              {!user.isOneWallet ? (
                <Error error="ONE Wallet not found" />
              ) : null}
            </Box>
          )}
        </Box>

        <Box direction="column" margin={{ top: 'medium' }}>
          <Box
            direction="row"
            align="center"
            justify="between"
            margin={{ bottom: 'xsmall' }}
          >
            <Box direction="row" align="center">
              <img className={styles.imgToken} src="/eth.svg" />
              <Title margin={{ right: 'xsmall' }}>Ethereum</Title>
              <Text margin={{ top: '4px' }}>(Metamask)</Text>
            </Box>
            {userMetamask.isAuthorized && (
              <Box
                onClick={() => {
                  userMetamask.signOut();
                }}
                margin={{ left: 'medium' }}
              >
                <Icon
                  glyph="Logout"
                  size="24px"
                  style={{ opacity: 0.5 }}
                  color="BlackTxt"
                />
              </Box>
            )}
          </Box>

          {userMetamask.isAuthorized ? (
            <>
              <AssetRow
                asset="ETH Address"
                value={truncateAddressString(userMetamask.ethAddress)}
              />

              <AssetRow
                asset="ETH"
                value={formatWithSixDecimals(userMetamask.ethBalance)}
              />

              <AssetRow
                asset="Ethereum BUSD"
                value={formatWithTwoDecimals(userMetamask.ethBUSDBalance)}
                selected={exchange.token === TOKEN.BUSD}
              />

              <AssetRow
                asset="Ethereum LINK"
                value={formatWithTwoDecimals(userMetamask.ethLINKBalance)}
                selected={exchange.token === TOKEN.LINK}
                last={true}
              />
            </>
          ) : (
            <Box direction="row" align="baseline" justify="start">
              <Button
                margin={{ vertical: 'medium' }}
                onClick={() => {
                  userMetamask.signIn();
                }}
              >
                Connect Metamask
              </Button>
              {userMetamask.error ? <Error error={userMetamask.error} /> : null}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
});
