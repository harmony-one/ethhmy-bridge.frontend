import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { Button, Icon, Text, Title } from 'components/Base';
import { Error } from 'ui';
import cn from 'classnames';
import * as styles from './wallet-balances.styl';
import { formatWithSixDecimals, ones, truncateAddressString } from 'utils';
import { useStores } from '../../stores';
import { AuthWarning } from '../../components/AuthWarning';
import { EXCHANGE_MODE, TOKEN } from '../../stores/interfaces';

// import { Routes } from '../../constants';

const AssetRow = observer<any>(props => {
  return (
    <Box
      className={cn(
        styles.walletBalancesRow,
        props.last ? '' : styles.underline,
      )}
    >
      <Box direction="row" align="center" justify="center">
        <Text color={props.selected ? '#00ADE8' : null} bold={false}>
          {props.asset}
        </Text>
        {props.link ? (
          <a
            href={props.link}
            target="_blank"
            style={{ textDecoration: 'none' }}
          >
            <Icon
              glyph="ExternalLink"
              style={{ width: 14, margin: '0 0 2px 10px' }}
            />
          </a>
        ) : null}
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
  const { user, userMetamask, actionModals, exchange, tokens } = useStores();

  return (
    <Box
      direction="column"
      className={styles.walletBalances}
      margin={{ vertical: 'large' }}
    >
      {/*<Title>Wallet Info</Title>*/}

      <Box className={styles.container}>
        <Box direction="column" margin={{ bottom: 'large' }}>
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
                selected={
                  exchange.token === TOKEN.ETH &&
                  exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT
                }
              />

              {tokens.allData
                .filter(token => token.display_props)
                .map((token, idx) => (
                  <AssetRow
                    key={idx}
                    asset={token.display_props.symbol}
                    value={formatWithSixDecimals(
                      userMetamask.balanceToken[token.src_coin] || '0',
                    )}
                    link={`${process.env.ETH_EXPLORER_URL}/token/${token.src_address}`}
                    selected={
                      exchange.token === TOKEN.ERC20 &&
                      exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT &&
                      userMetamask.erc20Address === token.src_address
                    }
                  />
                ))}
            </>
          ) : (
            <Box direction="row" align="baseline" justify="start">
              <Button
                margin={{ vertical: 'medium' }}
                onClick={() => {
                  userMetamask.signIn(true);
                }}
              >
                Connect Metamask
              </Button>
              {userMetamask.error ? <Error error={userMetamask.error} /> : null}
            </Box>
          )}
        </Box>

        <Box direction="column">
          <Box direction="row" justify="between" margin={{ bottom: 'xsmall' }}>
            <Box direction="row" align="center">
              <img className={styles.imgToken} src="/scrt.svg" />
              <Title margin={{ right: 'xsmall' }}>Secret Network</Title>
              <Text margin={{ top: '4px' }}>(Keplr)</Text>
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
                asset="Secret Address"
                value={truncateAddressString(user.address)}
              />
              <AssetRow
                asset="sETH"
                value={formatWithSixDecimals(
                  user.balanceToken['Ethereum'] || '0',
                )}
                link={(() => {
                  const eth = tokens.allData.find(
                    token => token.src_coin === 'Ethereum',
                  );
                  if (!eth) {
                    return undefined;
                  }
                  return `${process.env.SCRT_EXPLORER_URL}/account/${eth.dst_address}`;
                })()}
                selected={
                  exchange.token === TOKEN.ETH &&
                  exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH
                }
              />
              {tokens.allData
                .filter(token => token.display_props)
                .map((token, idx) => (
                  <AssetRow
                    key={idx}
                    asset={'s' + token.display_props.symbol}
                    value={formatWithSixDecimals(
                      user.balanceToken[token.src_coin] || '0',
                    )}
                    link={`${process.env.SCRT_EXPLORER_URL}/account/${token.dst_address}`}
                    selected={
                      exchange.token === TOKEN.ERC20 &&
                      exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH &&
                      user.snip20Address === token.dst_address
                    }
                  />
                ))}
            </>
          ) : (
            <Box direction="row" align="baseline" justify="start">
              <Button
                margin={{ vertical: 'medium' }}
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
                Connect Keplr
              </Button>
              {!user.isKeplrWallet ? <Error error="Keplr not found" /> : null}
              {user.error ? <Error error={user.error} /> : null}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
});
