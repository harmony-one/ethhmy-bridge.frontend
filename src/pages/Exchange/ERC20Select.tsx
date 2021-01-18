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
import { Spinner } from '../../ui/Spinner';

const labels: Record<string, string> = {
  [TOKEN.ERC20]: 'ERC20 token address',
  [TOKEN.ERC721]: 'ERC721 token address',
  [TOKEN.HRC20]: 'HRC20 token address',
};

const placeholder: Record<string, string> = {
  [TOKEN.ERC20]: 'Select your ERC20 token',
  [TOKEN.ERC721]: 'Select your ERC721 token',
  [TOKEN.HRC20]: 'Select your HRC20 token',
};

const inputPlaceholder: Record<string, string> = {
  [TOKEN.ERC20]: 'Input ERC20 token address',
  [TOKEN.ERC721]: 'Input ERC721 token address',
  [TOKEN.HRC20]: 'Input HRC20 token address',
};

export const ERC20Select = observer<{ type: TOKEN; options?: boolean }>(
  ({ type, options }) => {
    const { userMetamask, tokens, user, exchange } = useStores();
    const [erc20, setERC20] = useState(
      type === TOKEN.HRC20 ? user.hrc20Address : userMetamask.erc20Address,
    );
    const [error, setError] = useState('');
    const [token, setToken] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [custom, setCustom] = useState(false);

    const getTokens = () => {
      return process.env.NETWORK === 'testnet'
        ? tokens.allData
            .filter(t => !['BUSD', 'LINK'].includes(t.symbol))
            .map(t => ({
              address: t.erc20Address,
              label: `${t.name} (${t.symbol})`,
              image: '/eth.svg',
            }))
        : tokensMainnet;
    };

    const [tokensList, setTokensList] = useState([]);

    useEffect(() => {
      if (!!tokensList.length) {
        return;
      }

      setTokensList(getTokens());
    }, [tokens.data]);

    useEffect(() => {
      if (type === TOKEN.HRC20) {
        setERC20(user.hrc20Address);
        setToken(user.hrc20Address);
      } else {
        setERC20(userMetamask.erc20Address);
        setToken(userMetamask.erc20Address);
      }
    }, [userMetamask.erc20Address, user.hrc20Address]);

    // if(isLoading) {
    //   return <Spinner />
    // }

    return (
      <Box direction="column" margin={{ top: 'xlarge' }}>
        <Box direction="row" align="center" justify="between">
          <Text size="large" bold>
            {labels[type]}
          </Text>

          <Checkbox
            disabled={isLoading}
            label="use custom address"
            value={!options || custom}
            onChange={setCustom}
          />
        </Box>

        {options && !custom ? (
          <Box margin={{ top: 'small', bottom: 'medium' }}>
            <Select
              disabled={isLoading}
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
              placeholder={placeholder[type]}
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
                  href={`${process.env.ETH_EXPLORER_URL}/token/${token}`}
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
                disabled={isLoading}
                placeholder={inputPlaceholder[type]}
                value={erc20}
                onChange={setERC20}
              />
            </Box>
            <Box direction="row" justify="end">
              {isLoading ? (
                <Spinner boxSize={12} />
              ) : (
                <Button
                  disabled={isLoading}
                  onClick={async () => {
                    exchange.error = '';
                    setError('');
                    setLoading(true);
                    try {
                      switch (type) {
                        case TOKEN.ERC721:
                          await userMetamask.setERC721Token(erc20);
                          break;

                        case TOKEN.ERC20:
                          await userMetamask.setToken(erc20);
                          break;

                        case TOKEN.HRC20:
                          await user.setHRC20Mapping(erc20);
                          break;
                      }
                    } catch (e) {
                      setError(e.message);
                    }
                    setLoading(false);
                  }}
                >
                  {erc20 ? 'Change token' : 'Select token'}
                </Button>
              )}
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
