import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box, Grid } from 'grommet';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { Button, Checkbox, Select, Text, TextInput, Title } from 'components/Base';
import * as styles from './styles.styl';
import { truncateAddressString } from '../../utils';
import { NETWORK_TYPE, TOKEN } from '../../stores/interfaces';
import { Spinner } from '../../ui/Spinner';
import { useMediaQuery } from 'react-responsive';
import { isRequired, NumberInput } from '../../components/Form';

const labels: Record<NETWORK_TYPE, Record<string, string>> = {
  [NETWORK_TYPE.ETHEREUM]: {
    [TOKEN.ERC20]: 'ERC20 token address',
    [TOKEN.ERC721]: 'ERC721 token address',
    [TOKEN.HRC721]: 'HRC721 token address',
    [TOKEN.ERC1155]: 'ERC1155 token address',
    [TOKEN.HRC1155]: 'HRC1155 token address',
    [TOKEN.HRC20]: 'HRC20 token address',
  },
  [NETWORK_TYPE.BINANCE]: {
    [TOKEN.ERC20]: 'BEP20 token address',
    [TOKEN.ERC721]: 'ERC721 token address',
    [TOKEN.HRC20]: 'HRC20 token address',
  },
  [NETWORK_TYPE.HARMONYSHARD1]: {
    [TOKEN.ERC20]: 'GHRC20 token address',
    [TOKEN.ERC721]: 'GHRC721 token address',
    [TOKEN.HRC721]: 'HRC721 token address',
    [TOKEN.ERC1155]: 'GHRC1155 token address',
    [TOKEN.HRC1155]: 'HRC1155 token address',
    [TOKEN.HRC20]: 'HRC20 token address',
  },
};

const placeholder: Record<NETWORK_TYPE, Record<string, string>> = {
  [NETWORK_TYPE.ETHEREUM]: {
    [TOKEN.ERC20]: 'Select your ERC20 token',
    [TOKEN.ERC721]: 'Select your ERC721 token',
    [TOKEN.HRC721]: 'Select your HRC721 token',
    [TOKEN.ERC1155]: 'Select your ERC1155 token',
    [TOKEN.HRC1155]: 'Select your HRC1155 token',
    [TOKEN.HRC20]: 'Select your HRC20 token',
  },
  [NETWORK_TYPE.BINANCE]: {
    [TOKEN.ERC20]: 'Select your BEP20 token',
    [TOKEN.ERC721]: 'Select your ERC721 token',
    [TOKEN.HRC20]: 'Select your HRC20 token',
  },
  [NETWORK_TYPE.HARMONYSHARD1]: {
    [TOKEN.ERC20]: 'Select your GHRC20 token',
    [TOKEN.ERC721]: 'Select your GHRC721 token',
    [TOKEN.HRC721]: 'Select your HRC721 token',
    [TOKEN.ERC1155]: 'Select your GHRC1155 token',
    [TOKEN.HRC1155]: 'Select your HRC1155 token',
    [TOKEN.HRC20]: 'Select your HRC20 token',
  },
};

const inputPlaceholder: Record<NETWORK_TYPE, Record<string, string>> = {
  [NETWORK_TYPE.ETHEREUM]: {
    [TOKEN.ERC20]: 'Input ERC20 token address',
    [TOKEN.ERC721]: 'Input ERC721 token address',
    [TOKEN.HRC721]: 'Input HRC721 token address',
    [TOKEN.ERC1155]: 'Input ERC1155 token address',
    [TOKEN.HRC1155]: 'Input HRC1155 token address',
    [TOKEN.HRC20]: 'Input HRC20 token address',
  },
  [NETWORK_TYPE.BINANCE]: {
    [TOKEN.ERC20]: 'Input BEP20 token address',
    [TOKEN.ERC721]: 'Input ERC721 token address',
    [TOKEN.HRC20]: 'Input HRC20 token address',
  },
  [NETWORK_TYPE.HARMONYSHARD1]: {
    [TOKEN.ERC20]: 'Input GHRC20 token address',
    [TOKEN.ERC721]: 'Input GHRC721 token address',
    [TOKEN.HRC721]: 'Input HRC721 token address',
    [TOKEN.ERC1155]: 'Input GHRC1155 token address',
    [TOKEN.HRC1155]: 'Input HRC1155 token address',
    [TOKEN.HRC20]: 'Input HRC20 token address',
  },
};

export const ERC20Select = observer<{ type: TOKEN; options?: boolean }>(
  ({ type, options }) => {
    const { erc20Select, exchange, actionModals, user } = useStores();

    const [custom, setCustom] = useState(false);
    const [erc20, setErc20] = useState('');
    const [hrc1155TokenId, setHrc1155TokenIdOri] = useState('');
    const isMobile = useMediaQuery({ query: '(max-width: 600px)' });

    useEffect(() => setErc20(erc20Select.tokenAddress), [
      erc20Select.tokenAddress,
    ]);

    const setHrc1155TokenId = (hrc1155TokenId) => {
      erc20Select.hrc1155TokenId = hrc1155TokenId
      setHrc1155TokenIdOri(hrc1155TokenId)
    }

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
            {
              (type === TOKEN.ERC1155 || type === TOKEN.HRC1155) && (
                <>
                  <Text bold={true} size="large">
                    {type.toUpperCase()} token ID
                  </Text>
                  <Box margin={{ top: 'xsmall', bottom: 'medium' }}>
                    <div style={{ width: '100%' }}>
                      <NumberInput
                        disabled={erc20Select.isLoading}
                        name={`hrc1155TokenId`}
                        type="integerString"
                        delimiter="."
                        placeholder="0"
                        style={{ width: '100%' }}
                        rules={[isRequired]}
                        value={hrc1155TokenId}
                        onChange={setHrc1155TokenId}
                      />
                    </div>
                  </Box>
                </>
              )
            }
            <Grid columns={['1/2', '1/2']}>
              <Box direction="column" align="start">
                { erc20 !== "" && erc20Select.erc20VerifiedInfo
                && erc20Select.erc20VerifiedInfo.collection.safelist_request_status === 'verified'
                && erc20Select.erc20VerifiedInfo.address === erc20
                && (
                  <a target="_blank" rel="noreferrer" href={`https://opensea.io/collection/${erc20Select.erc20VerifiedInfo.collection.slug}`}>
                    <svg width='186.5'
                         height='28' role='img' aria-label='VERIFIED BY: OPENSEA'>
                      <clipPath id="r">
                        <rect width="186.5" height="28" rx="3" fill="#fff" />
                      </clipPath>
                      <g clip-path="url(#r)" shape-rendering='crispEdges'>
                        <rect width='101.75' height='28' fill='#555' />
                        <rect x='101.75' width='84.75' height='28' fill='#0083e9' />
                      </g>
                      <g fill='#fff' text-anchor='middle' font-family='Verdana,Geneva,DejaVu Sans,sans-serif'
                         text-rendering='geometricPrecision' font-size='100'>
                        <text transform='scale(.1)' x='508.75' y='175' textLength='777.5' fill='#fff'>VERIFIED BY</text>
                        <text transform='scale(.1)' x='1441.25' y='175' textLength='607.5' fill='#fff'
                              font-weight='bold'>OPENSEA
                        </text>
                      </g>
                    </svg>
                  </a>
                )}
              </Box>
              <Box direction="column" align="end">
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
            </Grid>
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
