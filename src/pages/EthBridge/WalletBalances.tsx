import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { Button, Icon, Text, Title } from 'components/Base';
import { Error, SliceTooltip } from 'ui';
import cn from 'classnames';
import * as styles from './wallet-balances.styl';
import { formatWithSixDecimals, ones, truncateAddressString } from 'utils';
import { useStores } from '../../stores';
import { AuthWarning } from '../../components/AuthWarning';
import { TOKEN } from '../../stores/interfaces';
import { getBech32Address } from '../../blockchain-bridge';
import { WalletButton } from './WalletButton';

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
          <SliceTooltip value={props.asset} maxLength={18} />
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
            <Box direction="column" align="center">
              <Box direction="row" align="center">
                <img className={styles.imgToken} src="/eth.svg" />
                <Title margin={{ right: 'xsmall' }}>Ethereum</Title>
              </Box>
              <Text style={{ marginTop: 0 }}>
                network:{' '}
                {process.env.NETWORK === 'mainnet' ? 'mainnet' : 'kovan'}
              </Text>
            </Box>

            {userMetamask.isAuthorized && (
              <Box
                direction="row"
                align="center"
                pad={{ horizontal: 'small', vertical: 'xxsmall' }}
                style={{
                  border: '1px solid #dedede',
                  borderRadius: 5,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  userMetamask.signOut();
                }}
              >
                {userMetamask.isAuthorized && (
                  <>
                    <img
                      src="/metamask.svg"
                      style={{ marginTop: -2, marginRight: 5, height: 20 }}
                    />
                    <Text margin={{ right: '10px' }}>Metamask</Text>
                  </>
                )}

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
            !userMetamask.isNetworkActual ? (
              <Box>
                <Text>
                  You have authorised with Metamask, but the selected network
                  does not match{' '}
                  <span style={{ color: 'rgb(0, 173, 232)' }}>
                    Ethereum:{' '}
                    {process.env.NETWORK === 'mainnet' ? 'mainnet' : 'kovan'}
                  </span>
                  . Please change network to{' '}
                  {process.env.NETWORK === 'mainnet' ? 'mainnet' : 'kovan'} for
                  transfer ETH -> ONE with Metamask.
                </Text>
              </Box>
            ) : (
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
            )
          ) : (
            <WalletButton
              onClick={() => {
                userMetamask.signIn();
              }}
              error={userMetamask.error}
            >
              <img
                src="/metamask.svg"
                style={{ marginRight: 15, height: 22 }}
              />
              Metamask
            </WalletButton>
          )}
        </Box>

        <Box direction="column">
          <Box
            direction="row"
            align="center"
            justify="between"
            margin={{ bottom: 'xsmall' }}
          >
            <Box direction="column" align="center">
              <Box direction="row" align="center">
                <img className={styles.imgToken} src="/one.svg" />
                <Title margin={{ right: 'xsmall' }}>Harmony</Title>
              </Box>
              <Text style={{ marginTop: 0 }}>
                network:{' '}
                {process.env.NETWORK === 'mainnet' ? 'mainnet' : 'testnet'}
              </Text>
            </Box>

            {user.isAuthorized && (
              <Box
                direction="row"
                align="center"
                pad={{ horizontal: 'small', vertical: 'xxsmall' }}
                style={{
                  border: '1px solid #dedede',
                  borderRadius: 5,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  user.signOut();
                }}
              >
                {user.isAuthorized && (
                  <>
                    <img
                      src={user.isMetamask ? '/metamask.svg' : '/one.svg'}
                      style={{
                        marginTop: user.isMetamask ? -2 : -4,
                        marginRight: 5,
                        height: 20,
                      }}
                    />
                    <Text margin={{ right: '10px' }}>
                      {user.isMetamask ? 'Metamask' : 'ONE Wallet'}
                    </Text>
                  </>
                )}

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
            user.isMetamask && !user.isNetworkActual ? (
              <Box>
                <Text>
                  You have authorised with Metamask, but the selected network
                  does not match{' '}
                  <span style={{ color: 'rgb(0, 173, 232)' }}>
                    Harmony:{' '}
                    {process.env.NETWORK === 'mainnet' ? 'mainnet' : 'testnet'}
                  </span>
                  . Please{' '}
                  <a
                    href="https://docs.harmony.one/home/developers/wallets/metamask"
                    target="_blank"
                    rel="noopener norefferer"
                  >
                    add
                  </a>{' '}
                  and select an actual network for transfer ONE -> ETH with
                  Metamask.
                </Text>
              </Box>
            ) : (
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
            )
          ) : (
            <Box direction="column" justify="start" align="start">
              <WalletButton
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
                error={!user.isOneWallet && 'ONE Wallet not found'}
              >
                <img
                  src="/one.svg"
                  style={{ marginRight: 10, marginTop: -2 }}
                />
                One Wallet
              </WalletButton>

              <WalletButton
                onClick={() => {
                  user.signInMetamask();
                }}
                error={user.error}
              >
                <img
                  src="/metamask.svg"
                  style={{ marginRight: 15, height: 22 }}
                />
                Metamask
              </WalletButton>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
});
