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
import { TOKEN } from '../../stores/interfaces';
import { getBech32Address } from '../../blockchain-bridge';
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
                selected={exchange.token === TOKEN.ETH}
              />

              {userMetamask.erc20TokenDetails && userMetamask.erc20Address ? (
                <AssetRow
                  asset={`Ethereum ${userMetamask.erc20TokenDetails.symbol}`}
                  value={formatWithSixDecimals(userMetamask.erc20Balance)}
                  selected={[
                    TOKEN.ERC20,
                    TOKEN.HRC20,
                    TOKEN.ERC721,
                    TOKEN.ONE,
                  ].includes(exchange.token)}
                  link={`${process.env.ETH_EXPLORER_URL}/token/${userMetamask.erc20Address}`}
                />
              ) : null}

              <AssetRow
                asset="Ethereum BUSD"
                value={formatWithSixDecimals(userMetamask.ethBUSDBalance)}
                selected={exchange.token === TOKEN.BUSD}
                link={`${process.env.ETH_EXPLORER_URL}/token/${process.env.ETH_BUSD_CONTRACT}`}
              />

              <AssetRow
                asset="Ethereum LINK"
                value={formatWithSixDecimals(userMetamask.ethLINKBalance)}
                selected={exchange.token === TOKEN.LINK}
                link={`${process.env.ETH_EXPLORER_URL}/token/${process.env.ETH_LINK_CONTRACT}`}
                last={true}
              />
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
                value={formatWithSixDecimals(ones(user.balance))}
                selected={[TOKEN.ONE].includes(exchange.token)}
              />

              {user.hrc20Address &&
              [TOKEN.ERC20, TOKEN.HRC20, TOKEN.ERC721].includes(
                exchange.token,
              ) ? (
                <AssetRow
                  asset={`Harmony ${userMetamask.erc20TokenDetails.symbol}`}
                  value={formatWithSixDecimals(user.hrc20Balance)}
                  selected={[TOKEN.ERC20, TOKEN.HRC20, TOKEN.ERC721].includes(
                    exchange.token,
                  )}
                  link={`${
                    process.env.HMY_EXPLORER_URL
                  }/address/${getBech32Address(
                    user.hrc20Address,
                  )}?txType=hrc20`}
                />
              ) : null}

              {user.hrc20Address && exchange.token === TOKEN.ETH ? (
                <AssetRow
                  asset={`Harmony ${userMetamask.erc20TokenDetails.symbol}`}
                  value={formatWithSixDecimals(user.hrc20Balance)}
                  selected={exchange.token === TOKEN.ETH}
                  link={`${
                    process.env.HMY_EXPLORER_URL
                  }/address/${getBech32Address(
                    user.hrc20Address,
                  )}?txType=hrc20`}
                />
              ) : null}

              <AssetRow
                asset="Harmony BUSD"
                value={formatWithSixDecimals(user.hmyBUSDBalance)}
                selected={exchange.token === TOKEN.BUSD}
                link={`${
                  process.env.HMY_EXPLORER_URL
                }/address/${getBech32Address(
                  process.env.HMY_BUSD_CONTRACT,
                )}?txType=hrc20`}
              />

              <AssetRow
                asset="Harmony LINK"
                value={formatWithSixDecimals(user.hmyLINKBalance)}
                selected={exchange.token === TOKEN.LINK}
                link={`${
                  process.env.HMY_EXPLORER_URL
                }/address/${getBech32Address(
                  process.env.HMY_LINK_CONTRACT,
                )}?txType=hrc20`}
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
      </Box>
    </Box>
  );
});
