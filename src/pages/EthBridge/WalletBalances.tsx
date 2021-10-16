import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { Icon, Text, Title } from 'components/Base';
import { SliceTooltip } from 'ui';
import cn from 'classnames';
import * as styles from './wallet-balances.styl';
import { formatWithSixDecimals, ones, truncateAddressString } from 'utils';
import { useStores } from '../../stores';
import { AuthWarning } from '../../components/AuthWarning';
import { NETWORK_TYPE, TOKEN } from '../../stores/interfaces';
import { getBech32Address } from '../../blockchain-bridge';
import { WalletButton } from './WalletButton';
import {
  NETWORK_BASE_TOKEN,
  NETWORK_ICON,
  NETWORK_NAME,
} from '../../stores/names';
import { AddTokenIcon } from '../../ui/AddToken';
import { useMediaQuery } from 'react-responsive';

const AssetRow = observer<any>(props => {
  const { exchange, userMetamask } = useStores();

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
              style={{ width: 14, margin: '0 5px 2px 10px' }}
            />
          </a>
        ) : null}
        {props.metamask && userMetamask.erc20TokenDetails ? (
          <AddTokenIcon
            hrc20Address={props.metamask}
            symbol={userMetamask.erc20TokenDetails.symbol}
            decimals={userMetamask.erc20TokenDetails.decimals}
            network={exchange.network}
          />
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

  const isMobile = useMediaQuery({ query: '(max-width: 600px)' });

  const isEthereumNetwork = exchange.network === NETWORK_TYPE.ETHEREUM;

  const externalNetworkName = NETWORK_NAME[exchange.network];
  const externalNetworkIcon = NETWORK_ICON[exchange.network];
  const externalNetworkToken = NETWORK_BASE_TOKEN[exchange.network];

  const externalSubNetworkName =
    exchange.network === NETWORK_TYPE.ETHEREUM
      ? process.env.NETWORK === 'mainnet'
        ? 'mainnet'
        : 'kovan'
      : process.env.NETWORK === 'mainnet'
      ? 'mainnet'
      : 'testnet';

  return (
    <Box
      direction="column"
      className={styles.walletBalances}
      margin={{ vertical: 'medium' }}
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
                <img
                  className={styles.imgToken}
                  style={{ height: 20 }}
                  src={isEthereumNetwork ? '/eth.svg' : '/binance.png'}
                />
                <Title margin={{ right: 'xsmall' }}>
                  {externalNetworkName}
                </Title>
              </Box>
              <Text style={{ marginTop: 0 }}>
                network: {externalSubNetworkName}
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
                    {!isMobile ? (
                      <Text margin={{ right: '10px' }}>Metamask</Text>
                    ) : null}
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
                    {externalNetworkName}: {externalSubNetworkName}
                  </span>
                  . Please change network to {externalSubNetworkName} for
                  transfer {externalNetworkName} -> Harmony with Metamask.
                </Text>
              </Box>
            ) : (
              <>
                <AssetRow
                  asset={`${externalNetworkToken} Address`}
                  value={truncateAddressString(
                    userMetamask.ethAddress,
                    isMobile ? 6 : 12,
                  )}
                />

                <AssetRow
                  asset={externalNetworkToken}
                  value={formatWithSixDecimals(userMetamask.ethBalance)}
                  selected={exchange.token === TOKEN.ETH}
                />

                {userMetamask.erc20TokenDetails && userMetamask.erc20Address ? (
                  <AssetRow
                    asset={`${externalNetworkName} ${userMetamask.erc20TokenDetails.symbol}`}
                    value={formatWithSixDecimals(userMetamask.erc20Balance)}
                    selected={[
                      TOKEN.ERC20,
                      TOKEN.HRC20,
                      TOKEN.ERC721,
                      TOKEN.HRC721,
                      TOKEN.ONE,
                    ].includes(exchange.token)}
                    link={`${exchange.config.explorerURL}/token/${userMetamask.erc20Address}`}
                  />
                ) : null}

                {exchange.network === NETWORK_TYPE.ETHEREUM ? (
                  <>
                    <AssetRow
                      asset={`${externalNetworkName} BUSD`}
                      value={formatWithSixDecimals(userMetamask.ethBUSDBalance)}
                      selected={exchange.token === TOKEN.BUSD}
                      link={`${exchange.config.explorerURL}/token/${process.env.ETH_BUSD_CONTRACT}`}
                    />

                    <AssetRow
                      asset={`${externalNetworkName} LINK`}
                      value={formatWithSixDecimals(userMetamask.ethLINKBalance)}
                      selected={exchange.token === TOKEN.LINK}
                      link={`${exchange.config.explorerURL}/token/${process.env.ETH_LINK_CONTRACT}`}
                      last={true}
                    />
                  </>
                ) : null}
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
                    {!isMobile ? (
                      <Text margin={{ right: '10px' }}>
                        {user.isMetamask ? 'Metamask' : 'ONE Wallet'}
                      </Text>
                    ) : null}
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
                  value={truncateAddressString(user.address, isMobile ? 6 : 12)}
                />

                <AssetRow
                  asset="Harmony ONE"
                  value={formatWithSixDecimals(ones(user.balance))}
                  selected={[TOKEN.ONE].includes(exchange.token)}
                />

                {user.hrc20Address &&
                [TOKEN.ERC20, TOKEN.HRC20].includes(
                  exchange.token,
                ) ? (
                  <AssetRow
                    asset={`Harmony ${
                      userMetamask.erc20TokenDetails
                        ? userMetamask.erc20TokenDetails.symbol
                        : ''
                    }`}
                    value={formatWithSixDecimals(user.hrc20Balance)}
                    selected={[TOKEN.ERC20, TOKEN.HRC20, TOKEN.ERC721, TOKEN.HRC721].includes(
                      exchange.token,
                    )}
                    link={`${
                      process.env.HMY_EXPLORER_URL
                    }/address/${getBech32Address(
                      user.hrc20Address,
                    )}?activeTab=3`}
                    metamask={
                      user.isMetamask &&
                      user.isAuthorized &&
                      user.isNetworkActual
                        ? user.hrc20Address
                        : ''
                    }
                  />
                ) : null}

                {user.hrc20Address &&
                [TOKEN.ERC721].includes(
                  exchange.token,
                ) ? (
                  <AssetRow
                    asset={`Harmony ${
                      userMetamask.erc20TokenDetails
                        ? userMetamask.erc20TokenDetails.symbol
                        : ''
                    }`}
                    value={formatWithSixDecimals(user.hrc20Balance)}
                    selected={[TOKEN.ERC20, TOKEN.HRC20, TOKEN.ERC721, TOKEN.HRC721].includes(
                      exchange.token,
                    )}
                    link={`${
                      process.env.HMY_EXPLORER_URL
                    }/address/${getBech32Address(
                      user.hrc20Address,
                    )}?txType=hrc721`}
                    metamask={
                      user.isMetamask &&
                      user.isAuthorized &&
                      user.isNetworkActual
                        ? user.hrc20Address
                        : ''
                    }
                  />
                ) : null}

                {user.hrc721Address &&
                [TOKEN.ERC721, TOKEN.HRC721].includes(
                  exchange.token,
                ) ? (
                  <AssetRow
                    asset={`Harmony ${
                      userMetamask.erc20TokenDetails
                        ? userMetamask.erc20TokenDetails.symbol
                        : ''
                    }`}
                    value={Number(user.hrc20Balance)}
                    selected={[TOKEN.ERC20, TOKEN.HRC20, TOKEN.ERC721, TOKEN.HRC721].includes(
                      exchange.token,
                    )}
                    link={`${
                      process.env.HMY_EXPLORER_URL
                    }/address/${getBech32Address(
                      user.hrc721Address,
                    )}?txType=hrc721`}
                    metamask={
                      user.isMetamask &&
                      user.isAuthorized &&
                      user.isNetworkActual
                        ? user.hrc20Address
                        : ''
                    }
                  />
                ) : null}

                {user.hrc1155Address &&
                [TOKEN.HRC1155].includes(
                  exchange.token,
                ) ? (
                  <AssetRow
                    asset={`Harmony ${
                      userMetamask.erc20TokenDetails
                        ? userMetamask.erc20TokenDetails.symbol
                        : ''
                    }`}
                    value={Number(user.hrc20Balance)}
                    selected={[TOKEN.ERC20, TOKEN.HRC20, TOKEN.ERC721, TOKEN.HRC721].includes(
                      exchange.token,
                    )}
                    link={`${
                      process.env.HMY_EXPLORER_URL
                    }/address/${getBech32Address(
                      user.hrc1155Address,
                    )}?txType=hrc1155`}
                    metamask={
                      user.isMetamask &&
                      user.isAuthorized &&
                      user.isNetworkActual
                        ? user.hrc20Address
                        : ''
                    }
                  />
                ) : null}

                {user.hrc20Address &&
                userMetamask.erc20TokenDetails &&
                exchange.token === TOKEN.ETH ? (
                  <AssetRow
                    asset={`Harmony ${userMetamask.erc20TokenDetails.symbol}`}
                    value={formatWithSixDecimals(user.hrc20Balance)}
                    selected={exchange.token === TOKEN.ETH}
                    link={`${
                      process.env.HMY_EXPLORER_URL
                    }/address/${getBech32Address(
                      user.hrc20Address,
                    )}?activeTab=3`}
                    metamask={
                      user.isMetamask &&
                      user.isAuthorized &&
                      user.isNetworkActual
                        ? user.hrc20Address
                        : ''
                    }
                  />
                ) : null}

                {exchange.network === NETWORK_TYPE.ETHEREUM ? (
                  <>
                    <AssetRow
                      asset="Harmony BUSD"
                      value={formatWithSixDecimals(user.hmyBUSDBalance)}
                      selected={exchange.token === TOKEN.BUSD}
                      link={`${
                        process.env.HMY_EXPLORER_URL
                      }/address/${getBech32Address(
                        process.env.HMY_BUSD_CONTRACT,
                      )}?activeTab=3`}
                    />

                    <AssetRow
                      asset="Harmony LINK"
                      value={formatWithSixDecimals(user.hmyLINKBalance)}
                      selected={exchange.token === TOKEN.LINK}
                      link={`${
                        process.env.HMY_EXPLORER_URL
                      }/address/${getBech32Address(
                        process.env.HMY_LINK_CONTRACT,
                      )}?activeTab=3`}
                    />
                  </>
                ) : null}
              </>
            )
          ) : (
            <Box direction="column" justify="start" align="start">
              {!isMobile ? (
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
              ) : null}

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
