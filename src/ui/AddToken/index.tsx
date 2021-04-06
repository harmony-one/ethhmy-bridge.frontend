import { Box } from 'grommet';
import { Icon } from '../../components/Base/components/Icons';
import { Button, Text } from '../../components/Base';
import * as React from 'react';
import { NETWORK_TYPE } from '../../stores/interfaces';
import { NETWORK_PREFIX } from '../../stores/names';
import * as styles from './add-token.styl';
import ReactTooltip from 'react-tooltip';

export const AddTokenIcon = (data: {
  hrc20Address: string;
  symbol: string;
  decimals: string;
  image?: string;
  network: NETWORK_TYPE;
}) => (
  <Box
    className={styles.addToken}
    onClick={() => {
      // const provider = window.web3.currentProvider;
      // @ts-ignore
      window.ethereum.request(
        {
          // method: 'metamask_watchAsset',
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: data.hrc20Address,
              symbol:
                !data.network || data.symbol.length > 3
                  ? data.symbol
                  : NETWORK_PREFIX[data.network] + data.symbol,
              decimals: data.decimals,
              image: data.image || '',
            },
          },
          // id: Math.round(Math.random() * 100000),
        },
        (err, added) => {
          console.log('provider returned', err, added);

          if (err || 'error' in added) {
            console.log(err, added.err);

            return;
          }

          console.log('success');
        },
      );
    }}
  >
    <a
      data-tip={`Add ${NETWORK_PREFIX[data.network] + data.symbol} to Metamask`}
    >
      <Icon size="12px" glyph="Plus" />
    </a>
    <ReactTooltip place="top" type="dark" effect="solid" />
  </Box>
);

export const AddTokenString = (data: {
  hrc20Address: string;
  symbol: string;
  decimals: string;
  image?: string;
  network: NETWORK_TYPE;
  position?: any;
}) => (
  <Box
    className={styles.addTokenString}
    direction="row"
    justify={data.position || 'start'}
    align="start"
    onClick={() => {
      // const provider = window.web3.currentProvider;
      // @ts-ignore
      window.ethereum.request(
        {
          // method: 'metamask_watchAsset',
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: data.hrc20Address,
              symbol:
                !data.network || data.symbol.length > 3
                  ? data.symbol
                  : NETWORK_PREFIX[data.network] + data.symbol,
              decimals: data.decimals,
              image: data.image || '',
            },
          },
          // id: Math.round(Math.random() * 100000),
        },
        (err, added) => {
          console.log('provider returned', err, added);

          if (err || 'error' in added) {
            console.log(err, added.err);

            return;
          }

          console.log('success');
        },
      );
    }}
  >
    <Text>
      Click to add the bridged token{' '}
      {NETWORK_PREFIX[data.network] + data.symbol} to{' '}
      <span className={styles.link}>Metamask</span>
    </Text>
  </Box>
);
