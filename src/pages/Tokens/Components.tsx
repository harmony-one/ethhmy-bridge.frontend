import { Box, BoxProps } from 'grommet';
import cn from 'classnames';
import * as styles from './styles.styl';
import { Text } from 'components/Base/components/Text';
import * as React from 'react';
import { EXCHANGE_MODE, NETWORK_TYPE } from 'stores/interfaces';
import { observer } from 'mobx-react';
import { useStores } from '../../stores';
import { formatWithSixDecimals } from '../../utils';
import { Button } from '../../components/Base/components/Button';
import { NETWORK_ICON, NETWORK_NAME } from '../../stores/names';
import { useMediaQuery } from 'react-responsive';

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
          props.isEth ? 'ETH' : 'ONE'
        }`}</Text>
        <Text size="xsmall" color="rgba(102, 102, 102, 0.9)">
          $
          {formatWithSixDecimals(
            props.value * (props.isEth ? user.ethRate : user.oneRate),
          )}
        </Text>
      </Box>
    );
  },
);

export const NetworkButton = observer(
  ({
    type,
    selectedType,
    onClick,
  }: {
    type: NETWORK_TYPE | 'ALL';
    selectedType: NETWORK_TYPE | 'ALL';
    onClick: () => void;
  }) => {
    const isMobile = useMediaQuery({ query: '(max-width: 600px)' });

    return (
      <Button
        className={
          cn()
          // styles.networkButton,
          // exchange.network === type ? styles.active : '',
        }
        style={{
          background: 'white',
          border:
            selectedType === type
              ? '2px solid #00ADE8'
              : '2px solid rgba(0,0,0,0)',
          color: '#212e5e',
          height: 46,
          padding: "12px 7px 0px 7px",
        }}
        onClick={onClick}
      >
        {NETWORK_ICON[type] ? (
          <img
            style={{ marginRight: 10, height: 20 }}
            src={NETWORK_ICON[type]}
          />
        ) : null}
        {NETWORK_NAME[type] || 'All'}
      </Button>
    );
  },
);
