import { Box } from 'grommet';
import cn from 'classnames';
import * as styles from './styles.styl';
import { Text } from 'components/Base/components/Text';
import * as React from 'react';
import { EXCHANGE_MODE } from 'stores/interfaces';

export const OperationType = (props: { type: EXCHANGE_MODE }) => {
  return (
    <Box
      direction={
        props.type === EXCHANGE_MODE.ETH_TO_ONE ? 'row' : 'row-reverse'
      }
      align="center"
      className={cn(styles.operationType)}
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
