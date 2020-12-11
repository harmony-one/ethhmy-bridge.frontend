import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { Button, TextInput, Text, Select, Checkbox } from 'components/Base';
import { useEffect, useState } from 'react';
import { tokensMainnet } from './tokens';
import * as styles from './styles.styl';
import { truncateAddressString } from '../../utils';
import { TOKEN } from '../../stores/interfaces';

export const ERC20Select = observer<{ type: TOKEN; options?: boolean }>(
  ({ type, options }) => {
    const { userMetamask, tokens } = useStores();
    const [erc20, setERC20] = useState(userMetamask.erc20Address);
    const [error, setError] = useState('');
    const [token, setToken] = useState('');
    const [custom, setCustom] = useState(false);

    const [tokensList, etTokensList] = useState([]);

    useEffect(() => {
      etTokensList(
        process.env.NETWORK === 'testnet'
          ? tokens.data.map(t => ({
              address: t.erc20Address,
              label: `${t.name} (${t.symbol})`,
              image: '/eth.svg',
            }))
          : tokensMainnet,
      );
    }, [tokens.data]);

    useEffect(() => {
      setERC20(userMetamask.erc20Address);
      setToken(userMetamask.erc20Address);
    }, [userMetamask.erc20Address]);

    return (
      <Box direction="column" margin={{ top: 'xlarge' }}>
        <Box direction="row" align="center" justify="between">
          <Text size="large" bold>
            {type === TOKEN.ERC721
              ? 'ERC721 token address'
              : 'ERC20 token address'}
          </Text>

          <Checkbox
            label="use custom address"
            value={!options || custom}
            onChange={setCustom}
          />
        </Box>

        {options && !custom ? (
          <Box margin={{ top: 'small', bottom: 'medium' }}>
            <Select
              options={tokensList.map(t => ({
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
              placeholder={
                type === TOKEN.ERC721
                  ? 'Select your ERC721 token'
                  : 'Select your ERC20 token'
              }
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
                  href={`https://etherscan.io/token/${token}`}
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
                placeholder={
                  type === TOKEN.ERC721
                    ? 'Input ERC721 token address'
                    : 'Input ERC20 token address'
                }
                value={erc20}
                onChange={setERC20}
              />
            </Box>
            <Box direction="row" justify="end">
              <Button
                onClick={async () => {
                  setError('');
                  try {
                    if (type === TOKEN.ERC721) {
                      await userMetamask.setERC721Token(erc20);
                    } else {
                      await userMetamask.setToken(erc20);
                    }
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
  },
);
