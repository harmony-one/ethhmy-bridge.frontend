import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { Button, TextInput, Text, Select, Checkbox } from 'components/Base';
import { useEffect, useState } from 'react';
import { tokens } from './tokens';
import * as styles from './styles.styl';
import { truncateAddressString } from '../../utils';

export const ERC20Select = observer(() => {
  const { userMetamask } = useStores();
  const [erc20, setERC20] = useState(userMetamask.erc20Address);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [custom, setCustom] = useState(false);

  useEffect(() => {
    setERC20(userMetamask.erc20Address);
    setToken(userMetamask.erc20Address);
  }, [userMetamask.erc20Address]);

  return (
    <Box direction="column" margin={{ top: 'xlarge' }}>
      <Box direction="row" align="center" justify="between">
        <Text size="large" bold>
          ERC20 token address
        </Text>

        <Checkbox
          label="use custom address"
          value={custom}
          onChange={setCustom}
        />
      </Box>

      {!custom ? (
        <Box margin={{ top: 'small', bottom: 'medium' }}>
          <Select
            options={tokens.map(t => ({
              ...t,
              text: t.label,
              value: t.address,
            }))}
            value={token}
            onChange={async value => {
              setToken(value);

              setError('');
              try {
                await userMetamask.setToken(value);
              } catch (e) {
                setError(e.message);
              }
            }}
            placeholder="Select your ERC20 token"
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
                href={`'https://etherscan.io/token/${token}`}
                target="_blank"
              >
                {truncateAddressString(token, 16)}
              </a>
            </Box>
          ) : null}
        </Box>
      ) : (
        <>
          <Box margin={{ top: 'xsmall', bottom: 'medium' }}>
            <TextInput
              placeholder="Input ERC20 token address"
              value={erc20}
              onChange={setERC20}
            />
          </Box>
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
