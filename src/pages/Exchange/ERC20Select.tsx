import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { Button, Checkbox, Select, Text, TextInput } from 'components/Base';
import { tokensMainnet } from './tokens';
import * as styles from './styles.styl';
import { truncateAddressString } from '../../utils';
import { NETWORK_TYPE, TOKEN } from '../../stores/interfaces';
import { Spinner } from '../../ui/Spinner';
import { NETWORK_ICON } from '../../stores/names';

const labels: Record<NETWORK_TYPE, Record<string, string>> = {
  [NETWORK_TYPE.ETHEREUM]: {
    [TOKEN.ERC20]: 'ERC20 token address',
    [TOKEN.ERC721]: 'ERC721 token address',
    [TOKEN.HRC20]: 'HRC20 token address',
  },
  [NETWORK_TYPE.BINANCE]: {
    [TOKEN.ERC20]: 'BEP20 token address',
    [TOKEN.ERC721]: 'ERC721 token address',
    [TOKEN.HRC20]: 'HRC20 token address',
  },
};

const placeholder: Record<NETWORK_TYPE, Record<string, string>> = {
  [NETWORK_TYPE.ETHEREUM]: {
    [TOKEN.ERC20]: 'Select your ERC20 token',
    [TOKEN.ERC721]: 'Select your ERC721 token',
    [TOKEN.HRC20]: 'Select your HRC20 token',
  },
  [NETWORK_TYPE.BINANCE]: {
    [TOKEN.ERC20]: 'Select your BEP20 token',
    [TOKEN.ERC721]: 'Select your ERC721 token',
    [TOKEN.HRC20]: 'Select your HRC20 token',
  },
};

const inputPlaceholder: Record<NETWORK_TYPE, Record<string, string>> = {
  [NETWORK_TYPE.ETHEREUM]: {
    [TOKEN.ERC20]: 'Input ERC20 token address',
    [TOKEN.ERC721]: 'Input ERC721 token address',
    [TOKEN.HRC20]: 'Input HRC20 token address',
  },
  [NETWORK_TYPE.BINANCE]: {
    [TOKEN.ERC20]: 'Input BEP20 token address',
    [TOKEN.ERC721]: 'Input ERC721 token address',
    [TOKEN.HRC20]: 'Input HRC20 token address',
  },
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
      if (
        exchange.network === NETWORK_TYPE.ETHEREUM &&
        process.env.NETWORK !== 'testnet'
      ) {
        return tokensMainnet;
      }

      return tokens.allData
        .filter(t => !['BUSD', 'LINK'].includes(t.symbol))
        .filter(t => t.network === exchange.network)
        .map(t => ({
          address: t.erc20Address,
          label: `${t.name} (${t.symbol})`,
          image: NETWORK_ICON[t.network],
        }));
    };

    useEffect(() => {
      setToken('');
      setError('');
      setLoading(true);
      setTimeout(() => setLoading(false), 300);
    }, [exchange.network]);

    const [tokensList, setTokensList] = useState([]);

    useEffect(() => {
      // if (!!tokensList.length) {
      //   return;
      // }

      setTokensList(getTokens());
    }, [tokens.data, exchange.network]);

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
            {labels[exchange.network][type]}
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
              placeholder={placeholder[exchange.network][type]}
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
                  href={`${exchange.config.explorerURL}/token/${token}`}
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
                placeholder={inputPlaceholder[exchange.network][type]}
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
