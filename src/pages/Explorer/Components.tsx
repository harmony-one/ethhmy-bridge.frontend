import { Box, BoxProps } from 'grommet';
import cn from 'classnames';
import * as styles from './styles.styl';
import { Text } from 'components/Base/components/Text';
import * as React from 'react';
import { EXCHANGE_MODE, TOKEN } from 'stores/interfaces';
import { observer } from 'mobx-react';
import { useStores } from '../../stores';
import { divDecimals, formatWithSixDecimals, mulDecimals } from '../../utils';

export const OperationType = (props: { type: EXCHANGE_MODE }) => {
  return (
    <Box
      direction={
        props.type === EXCHANGE_MODE.ETH_TO_SCRT ? 'row' : 'row-reverse'
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
          src="/scrt.svg"
        />
        <Text size="medium">ONE</Text>
      </Box>
    </Box>
  );
};

export const Price = observer(
  (props: { value: number; isEth: boolean; boxProps?: BoxProps }) => {
    const { user } = useStores();

    return (
      <Box
        direction="column"
        align="end"
        justify="center"
        pad={{ right: 'medium' }}
        {...props.boxProps}
      >
        <Text style={{ fontSize: 14 }}>{`${props.value} ${
          props.isEth ? 'ETH' : 'SCRT'
        }`}</Text>
        <Text size="xsmall" color="rgba(102, 102, 102, 0.9)">
          $
          {formatWithSixDecimals(
            props.value * (props.isEth ? user.ethRate : user.scrtRate),
          )}
        </Text>
      </Box>
    );
  },
);

interface IERC20TokenProps {
  value: TOKEN;
  erc20Address?: string;
}

interface ISecretTokenProps {
  value: TOKEN;
  secretAddress?: string;
}

interface ITokenParams {
  type: TOKEN;
  amount: string | number;
  address?: string;
}

export const FormatWithDecimals = observer((props: ITokenParams) => {
  const { tokens } = useStores();
  const { type, amount, address } = props;

  if (type === TOKEN.ERC20 || type === TOKEN.S20) {
    const token = tokens.data.find(
      t => t.src_address.toLowerCase() === address.toLowerCase(),
    );

    if (token) {
      return <Box>{divDecimals(amount, token.decimals)}</Box>;
    }
  } else if (type === TOKEN.ETH) {
    return <Box>{formatWithSixDecimals(amount)}</Box>;
  }

  return <Box>{amount}</Box>;
});

export const ERC20Token = observer((props: IERC20TokenProps) => {
  const { tokens } = useStores();
  const { value, erc20Address } = props;

  if (value === TOKEN.ERC20) {
    const token = tokens.data.find(
      t => t.src_address.toLowerCase() === erc20Address.toLowerCase(),
    );

    if (token && token.display_props) {
      return <Box>{token.display_props.symbol}</Box>;
    }
  } else if (value === TOKEN.ETH) {
    return <Box>ETH</Box>;
  }

  return <Box>{value ? value.toUpperCase() : '--'}</Box>;
});

export const SecretToken = observer((props: ISecretTokenProps) => {
  const { tokens } = useStores();
  const { value, secretAddress } = props;

  if (value === TOKEN.ERC20 || value === TOKEN.S20) {
    const token = tokens.data.find(
      t => t.dst_address.toLowerCase() === secretAddress.toLowerCase(),
    );

    if (token && token.display_props) {
      return <Box>secret{token.display_props.symbol}</Box>;
    }
  } else if (value === TOKEN.ETH) {
    return <Box>secretETH</Box>;
  }

  return <Box>{value ? value.toUpperCase() : '--'}</Box>;
});
