import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import {
  Button,
  Checkbox,
  Select,
  Text,
  TextInput,
  Title,
} from 'components/Base';
import * as styles from './styles.styl';
import { truncateAddressString } from '../../utils';
import { NETWORK_TYPE, TOKEN } from '../../stores/interfaces';
import { Spinner } from '../../ui/Spinner';
import { AuthWarning } from '../../components/AuthWarning';
import { useMediaQuery } from 'react-responsive';

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
    const { erc20Select, exchange, actionModals } = useStores();

    const [custom, setCustom] = useState(false);
    const [erc20, setErc20] = useState('');
    const isMobile = useMediaQuery({ query: '(max-width: 600px)' });

    useEffect(() => setErc20(erc20Select.tokenAddress), [
      erc20Select.tokenAddress,
    ]);

    return (
      <Box direction="column" margin={{ top: 'xlarge' }}>
        <Box direction="row" align="center" justify="between">
          <Text size="large" bold>
            {labels[exchange.network][type]}
          </Text>

          <Checkbox
            disabled={erc20Select.isLoading}
            label="use custom address"
            value={!options || custom}
            onChange={setCustom}
          />
        </Box>

        {options && !custom ? (
          <Box margin={{ top: 'small', bottom: 'medium' }}>
            <Select
              disabled={erc20Select.isLoading}
              options={erc20Select.tokensList
                .map(t => ({
                  ...t,
                  text: t.label,
                  value: t.address,
                }))
                .concat({
                  address: '',
                  label: '',
                  image: '',
                  text: '',
                  value: '',
                })}
              value={erc20Select.tokenAddress}
              onChange={async value => {
                erc20Select.setToken(value);
              }}
              placeholder={placeholder[exchange.network][type]}
            />
            {erc20Select.tokenAddress ? (
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
                    exchange.token === TOKEN.HRC20
                      ? `${process.env.HMY_EXPLORER_URL}/address/${erc20Select.tokenAddress}`
                      : `${exchange.config.explorerURL}/token/${erc20Select.tokenAddress}`
                  }
                  target="_blank"
                >
                  {truncateAddressString(
                    erc20Select.tokenAddress,
                    isMobile ? 8 : 16,
                  )}
                </a>
              </Box>
            ) : null}
          </Box>
        ) : (
          <>
            <Box margin={{ top: 'xsmall', bottom: 'medium' }}>
              <TextInput
                disabled={erc20Select.isLoading}
                placeholder={inputPlaceholder[exchange.network][type]}
                value={erc20}
                onChange={setErc20}
              />
            </Box>
            <Box direction="row" justify="end">
              {erc20Select.isLoading ? (
                <Spinner boxSize={12} />
              ) : (
                <Button
                  disabled={erc20Select.isLoading}
                  onClick={async () => erc20Select.setToken(erc20)}
                >
                  {erc20 ? 'Change token' : 'Select token'}
                </Button>
              )}
            </Box>
          </>
        )}

        {erc20Select.error ? (
          <Box margin={{ top: custom ? '10px' : '0px' }}>
            <Text color="red">{erc20Select.error}</Text>
          </Box>
        ) : null}

        {erc20Select.error &&
        (erc20Select.error.includes('This HRC20 address corresponds') ||
          erc20Select.error.includes('This address already using for')) ? (
          <Box
            margin={{ top: custom ? '10px' : '0px' }}
            fill={true}
            align="end"
          >
            <Button
              disabled={erc20Select.isLoading}
              onClick={async () => {
                return actionModals.open(
                  () => (
                    <Box pad="large" gap="10px">
                      <Title>Confirm</Title>
                      {/*<Text>{erc20Select.error}</Text>*/}
                      <Text>
                        Are you sure the HRC20 address you are using is not a
                        bridged HRC20?
                      </Text>
                    </Box>
                  ),
                  {
                    title: '',
                    applyText: 'Yes, i confirm',
                    closeText: 'Cancel',
                    noValidation: true,
                    width: '500px',
                    showOther: true,
                    onApply: () => {
                      return erc20Select.setToken(erc20, true);
                    },
                  },
                );
              }}
            >
              Use address anyway
            </Button>
          </Box>
        ) : null}

        {erc20Select.isOk ? (
          <Box margin={{ top: custom ? '10px' : '0px' }}>
            <Text color="green">Token selected successfully</Text>
          </Box>
        ) : null}
      </Box>
    );
  },
);
