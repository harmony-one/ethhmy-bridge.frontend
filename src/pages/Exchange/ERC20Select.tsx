import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { Button, TextInput, Text, Select, Checkbox } from 'components/Base';
import { useEffect, useState } from 'react';
import { tokens } from './tokens';
import * as styles from './styles.styl';
import { truncateAddressString } from '../../utils';
import { EXCHANGE_MODE } from 'stores/interfaces';

export const ERC20Select = observer(() => {
  const { userMetamask, exchange } = useStores();
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
            options={tokens.map(t => ({
              ...t,
              text:
                exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT
                  ? t.label
                  : t.secretLabel,
              value: t.address,
            }))}
            value={token}
            onChange={async value => {
              setToken(value);
              setSnip20(
                tokens.filter(t => t.address === value)[0].snip20address,
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
                    ? `https://etherscan.io/token/${token}`
                    : `https://explorer.secrettestnet.io/account/${snip20}`
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
