import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { Button, Select, Text } from 'components/Base';
// import { tokens } from './tokens';
import * as styles from './styles.styl';
import { truncateAddressString } from '../../utils';
import { EXCHANGE_MODE, ITokenInfo } from 'stores/interfaces';

const selectTokenText = (mode: string, token: ITokenInfo) => {
  if (mode === EXCHANGE_MODE.SCRT_TO_ETH && !token.display_props.proxy) {
    return `Secret ${token.name} (secret${token.display_props.symbol})`;
  } else if (mode !== EXCHANGE_MODE.SCRT_TO_ETH && !token.display_props.proxy) {
    return `${token.display_props.label} (${token.display_props.symbol})`;
  } else if (mode === EXCHANGE_MODE.SCRT_TO_ETH) {
    return `Secret ${token.display_props.label} (secret${token.display_props.label})`;
  } else {
    return `${token.display_props.label} (${token.name})`;
  }
};

export const ERC20Select = observer(() => {
  const { userMetamask, exchange, tokens } = useStores();
  const [erc20, setERC20] = useState(userMetamask.erc20Address);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [snip20, setSnip20] = useState('');
  const [custom, setCustom] = useState(false);

  useEffect(() => {
    setERC20(userMetamask.erc20Address);
    setToken(userMetamask.erc20Address);
  }, [userMetamask.erc20Address]);

  return (
    <Box direction="column" margin={{ top: 'xlarge' }}>
      <Box direction="row" align="center" justify="between">
        <Text size="large" bold>
          Token
        </Text>
      </Box>

      {!custom ? (
        <Box margin={{ top: 'small', bottom: 'medium' }}>
          <Select
            options={tokens.allData
              .filter(
                token => token.display_props && token.src_coin !== 'Ethereum',
              )
              .sort((a, b) =>
                /* SCRT first */
                a.display_props.symbol.toLowerCase().includes('scrt') ? -1 : 1,
              )
              .map(token => ({
                ...token,
                image: token.display_props.image,
                text: selectTokenText(exchange.mode, token),
                value: token.src_address,
              }))}
            value={token}
            onChange={async value => {
              setToken(value);
              setSnip20(
                tokens.allData.find(t => t.src_address === value).dst_address,
              );

              setError('');
              try {
                await userMetamask.setToken(value, tokens);
              } catch (e) {
                setError(e.message);
              }
            }}
            placeholder="Select your token"
          />
          {token ? (
            <Box
              direction="row"
              justify="between"
              align="center"
              margin={{ top: 'medium' }}
            >
              <Text>Address:</Text>
              <a
                className={styles.addressLink}
                href={
                  exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT
                    ? `${process.env.ETH_EXPLORER_URL}/token/${token}`
                    : `${process.env.SCRT_EXPLORER_URL}/contracts/${snip20}`
                }
                target="_blank"
              >
                {truncateAddressString(
                  exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT ? token : snip20,
                  16,
                )}
              </a>
            </Box>
          ) : null}
        </Box>
      ) : (
        <>
          <Box direction="row" justify="end">
            <Button
              onClick={async () => {
                setError('');
                try {
                  await userMetamask.setToken(erc20);
                } catch (e) {
                  setError(e.message);
                }
              }}
            >
              {erc20 ? 'Change token' : 'Select token'}
            </Button>
          </Box>
        </>
      )}

      {error ? (
        <Box>
          <Text color="red">{error}</Text>
        </Box>
      ) : null}
    </Box>
  );
});
