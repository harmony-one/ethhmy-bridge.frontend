import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { Button, Icon, Text, Title } from 'components/Base';
import { Error } from 'ui';
import cn from 'classnames';
import * as styles from './wallet-balances.styl';
import { truncateAddressString, unlockToken } from 'utils';
import { useStores } from '../../stores';
import { AuthWarning } from '../../components/AuthWarning';
import { EXCHANGE_MODE, ITokenInfo, TOKEN } from '../../stores/interfaces';
import Loader from 'react-loader-spinner';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import UnlockToken from 'components/Earn/EarnRow/UnlockToken';

const getTokenName = (tokenType: TOKEN, token: ITokenInfo) => {
  switch (tokenType) {
    case TOKEN.ERC20:
      if (!token.display_props.proxy) {
        return token.display_props.symbol;
      } else {
        return token.name;
      }
    case TOKEN.S20:
      if (!token.display_props.proxy) {
        return `secret${token.display_props.symbol}`;
      } else {
        return token.name;
      }
    case TOKEN.ETH:
    default:
      return `ETH`;
  }
};

const AssetRow = observer<any>(props => {
  let value = (
    <Box direction="row">
      <Text color={props.selected ? '#00ADE8' : null} bold={true}>
        {props.address ? truncateAddressString(props.value, 10) : props.value}
      </Text>
      {props.address && (
        <CopyToClipboard text={props.value}>
          <Icon glyph="PrintFormCopy" size="1em" color="#1c2a5e" style={{ marginLeft: 10, width: 20 }} />
        </CopyToClipboard>
      )}
    </Box>
  );

  if (!props.value) {
    value = <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" />;
  } else if (props.value === unlockToken) {
    value = (
      <div style={{ margin: 0, display: 'flex', flexDirection: 'row' }}>
        <UnlockToken
          userStore={props.userStore}
          tokenAddress={props.token.dst_address}
          selected={props.selected}
          subtitle={null}
          showSubTitle={false}
          pulseInterval={props.pulseInterval}
          title="View Balance"
        />
      </div>
    );
  } else if (props.value === 'Fix Unlock') {
    value = (
      <Box direction="column">
        <Text color="red">Fix Viewing Key</Text>
        <Text color="red" style={{ fontSize: '0.75em' }}>
          Keplr -{'>'}
        </Text>
        <Text color="red" style={{ fontSize: '0.75em' }}>
          Secret Network -{'>'}
        </Text>
        <Text color="red" style={{ fontSize: '0.75em' }}>
          Token List
        </Text>
      </Box>
    );
  }

  return (
    <Box className={cn(styles.walletBalancesRow, props.last ? '' : styles.underline)}>
      <Box direction="row" align="center" justify="center">
        <Text
          color={props.selected ? '#00ADE8' : null}
          bold={false}
          style={props.value === unlockToken ? { padding: '1em 0 1em 0' } : null}
        >
          {props.asset}
        </Text>
        {props.link ? (
          <a href={props.link} target="_blank" style={{ textDecoration: 'none' }}>
            <Icon glyph="ExternalLink" style={{ width: 14, margin: '0 0 2px 10px' }} />
          </a>
        ) : null}
      </Box>

      <Box direction="column" align="end">
        <Box className={styles.priceColumn}>{value}</Box>
      </Box>
    </Box>
  );
});

export const WalletBalances = observer(() => {
  const { user, userMetamask, actionModals, exchange, tokens } = useStores();

  return (
    <Box direction="column" className={styles.walletBalances} margin={{ vertical: 'large' }}>
      {/*<Title>Wallet Info</Title>*/}

      <Box className={styles.container}>
        <Box direction="column" margin={{ bottom: 'large' }}>
          <Box direction="row" align="center" justify="between" margin={{ bottom: 'xsmall' }}>
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
                <Icon glyph="Logout" size="24px" style={{ opacity: 0.5 }} color="BlackTxt" />
              </Box>
            )}
          </Box>

          {userMetamask.isAuthorized ? (
            <>
              <AssetRow asset="ETH Address" value={userMetamask.ethAddress} address={true} />

              <AssetRow
                asset="ETH"
                value={userMetamask.ethBalance}
                selected={exchange.token === TOKEN.ETH && exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT}
              />

              {tokens.allData
                .filter(
                  token =>
                    token.display_props &&
                    exchange.token === TOKEN.ERC20 &&
                    userMetamask.erc20Address === token.src_address,
                )
                .map((token, idx) => (
                  <AssetRow
                    key={idx}
                    asset={getTokenName(TOKEN.ERC20, token)}
                    value={userMetamask.balanceToken[token.src_coin]}
                    link={`${process.env.ETH_EXPLORER_URL}/token/${token.src_address}`}
                    selected={true}
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
                Connect with Metamask
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
                <Icon glyph="Logout" size="24px" style={{ opacity: 0.5 }} color="BlackTxt" />
              </Box>
            )}
          </Box>

          {user.isAuthorized ? (
            <>
              <AssetRow asset="Secret Address" value={user.address} address={true} />
              <AssetRow asset="SCRT" value={user.balanceSCRT} />
              <AssetRow
                asset="secretSCRT"
                value={user.balanceToken['sSCRT']}
                token={{ dst_address: process.env.SSCRT_CONTRACT }}
                userStore={user}
                link={`${process.env.SCRT_EXPLORER_URL}/contracts/${process.env.SSCRT_CONTRACT}`}
                selected={user.snip20Address === process.env.SSCRT_CONTRACT}
              />
              {exchange.token === TOKEN.ETH ? (
                <AssetRow
                  asset="secretETH"
                  value={user.balanceToken['Ethereum']}
                  token={tokens.allData.find(token => token.src_coin === 'Ethereum')}
                  userStore={user}
                  link={(() => {
                    const eth = tokens.allData.find(token => token.src_coin === 'Ethereum');
                    if (!eth) {
                      return undefined;
                    }
                    return `${process.env.SCRT_EXPLORER_URL}/contracts/${eth.dst_address}`;
                  })()}
                  selected={true}
                />
              ) : null}
              {tokens.allData
                .filter(
                  token =>
                    token.display_props &&
                    exchange.token === TOKEN.ERC20 &&
                    user.snip20Address === token.dst_address &&
                    token.name !== 'WSCRT',
                )
                .map((token, idx) => {
                  return (
                    <AssetRow
                      key={idx}
                      asset={getTokenName(TOKEN.S20, token)}
                      value={user.balanceToken[token.src_coin]}
                      token={token}
                      userStore={user}
                      link={`${process.env.SCRT_EXPLORER_URL}/contracts/${token.dst_address}`}
                      selected={
                        exchange.token === TOKEN.ERC20 &&
                        exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH &&
                        user.snip20Address === token.dst_address
                      }
                    />
                  );
                })}
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
                Connect with Keplr
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
