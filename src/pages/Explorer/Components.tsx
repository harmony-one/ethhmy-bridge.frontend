import { Box, BoxProps } from 'grommet';
import cn from 'classnames';
import * as styles from './styles.styl';
import { Text } from 'components/Base/components/Text';
import * as React from 'react';
import { useEffect } from 'react';
import { EXCHANGE_MODE, NETWORK_TYPE, TOKEN } from 'stores/interfaces';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';
import { formatWithSixDecimals, sliceByLength } from '../../utils';
import ReactTooltip from 'react-tooltip';
import { NETWORK_BASE_TOKEN } from '../../stores/names';

export const OperationType = (props: { type: EXCHANGE_MODE }) => {
  return (
    <Box
      direction={
        props.type === EXCHANGE_MODE.ETH_TO_ONE ? 'row' : 'row-reverse'
      }
      align="center"
      className={cn(styles.operationType)}
      margin={{ left: '20px' }}
    >
      <Box direction="row" align="center">
        <img
          className={styles.imgToken}
          style={{ height: 20 }}
          src="/eth.svg"
        />
        <Text size="medium">ETH</Text>
      </Box>
      <Box direction="row" margin={{ horizontal: 'xsmall' }} align="center">
        <img src="/right.svg" />
      </Box>
      <Box direction="row" align="center">
        <img
          className={styles.imgToken}
          style={{ height: 18 }}
          src="/one.svg"
        />
        <Text size="medium">ONE</Text>
      </Box>
    </Box>
  );
};

export const Price = observer(
  (props: {
    value: number;
    isEth: boolean;
    network: NETWORK_TYPE;
    boxProps?: BoxProps;
  }) => {
    const { user } = useStores();

    const externalNetworkRate =
      props.network === NETWORK_TYPE.ETHEREUM ? user.ethRate : user.bnbRate;

    const rate = props.isEth ? externalNetworkRate : user.oneRate;

    return (
      <Box
        direction="column"
        align="end"
        justify="center"
        pad={{ right: 'medium' }}
        {...props.boxProps}
      >
        <Text
          color="NWhite"
          bold
          style={{ fontSize: 14 }}
          nowrap
        >{`${formatWithSixDecimals(props.value)} ${
          props.isEth ? NETWORK_BASE_TOKEN[props.network] : 'ONE'
        }`}</Text>
        <Text color="NGray" bold size="xsmall">
          ${formatWithSixDecimals(props.value * rate)}
        </Text>
      </Box>
    );
  },
);

interface IERC20TokenProps {
  value: TOKEN;
  network: NETWORK_TYPE;
  erc20Address?: string;
  hrc20Address?: string;
}

export const ERC20Token = observer((props: IERC20TokenProps) => {
  const { tokens } = useStores();
  const { network, value, erc20Address = '', hrc20Address = '' } = props;

  useEffect(() => {
    ReactTooltip.rebuild();
  });

  if ([TOKEN.ERC20, TOKEN.ERC721, TOKEN.HRC721, TOKEN.HRC20].includes(value)) {
    const token =
      tokens.fetchStatus !== 'init' &&
      tokens.fullTokensList.find(
        t =>
          t.erc20Address.toLowerCase() === erc20Address.toLowerCase() ||
          t.hrc20Address.toLowerCase() === hrc20Address.toLowerCase(),
      );

    if (token) {
      return token.symbol.length > 9 ? (
        <Box>
          <a data-tip={token.symbol}>{sliceByLength(token.symbol, 9)}</a>
          <ReactTooltip place="top" type="dark" effect="solid" />
        </Box>
      ) : (
        <Box direction="row" align="center" gap="4px">
          <img src={token.image} height="16" width="16" />{' '}
          <Text size="small" margin={{ top: '2px' }}>
            {sliceByLength(token.symbol, 9)}
          </Text>
        </Box>
      );
    }
  }

  if (network === NETWORK_TYPE.BINANCE && value === TOKEN.ERC20) {
    return <Box>BEP20</Box>;
  }

  if (value === TOKEN.ETH) {
    return <Box>{NETWORK_BASE_TOKEN[network]}</Box>;
  }

  return <Box>{value ? value.toUpperCase() : '--'}</Box>;
});
