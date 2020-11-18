import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { Text } from 'components/Base';
import { Error } from 'ui';
import cn from 'classnames';
import * as styles from './feeds.styl';
import { useStores } from 'stores';
import { ACTION_TYPE, EXCHANGE_MODE, STATUS } from 'stores/interfaces';
import { dateTimeFormat, truncateAddressString } from '../../utils';

const StepRow = ({
  status,
  srcTransactionHash,
  dstTransactionHash,
  type,
}: {
  status: number;
  srcTransactionHash: string;
  dstTransactionHash?: string;
  type: EXCHANGE_MODE;
}) => {
  const label = StatusDescription[status]; //STEPS_TITLE[status];

  const textClassName = cn(styles.stepRow, styles.active);

  const srcExplorerUrl =
    (type === EXCHANGE_MODE.ETH_TO_SCRT
      ? process.env.ETH_EXPLORER_URL
      : process.env.SCRT_EXPLORER_URL) + '/tx/';

  return (
    <Box
      direction="column"
      style={{ borderBottom: '1px solid #dedede' }}
      margin={{ bottom: 'medium' }}
    >
      <Box direction="row" justify="between">
        {' '}
      </Box>
      <Text className={textClassName}>
        {label} {status === 7 ? `from ${WalletType[type]}` : null}
      </Text>

      {/*     {srcTransactionHash && (*/}
      {/*          <Box direction="row" justify="between">*/}
      {/*            <Text className={textClassName}>Tx hash: </Text>*/}
      {/*            <a href={srcExplorerUrl + srcTransactionHash} target="_blank">*/}
      {/*              {truncateAddressString(srcTransactionHash, 10)}*/}
      {/*            </a>*/}
      {/*          </Box>*/}
      {/*  )}*/}
      {/*</Box>*/}
    </Box>
  );
};

const WalletType: Record<EXCHANGE_MODE, string> = {
  [EXCHANGE_MODE.ETH_TO_SCRT]: 'Metamask',
  [EXCHANGE_MODE.SCRT_TO_ETH]: 'Keplr',
};

const StatusDescription: Record<number, string> = {
  1: 'Bridge confirmed Transaction, waiting for Signatures',
  2: 'Bridge Transaction Signed, waiting for broadcast',
  3: 'Bridge Transaction Sent, waiting for confirmation',
  4: 'Transfer Complete!',
  5: 'Transfer failed!',
  6: 'Sent Transaction... waiting for on-chain confirmation',
  7: 'Waiting for user transaction ',
};

export const Steps = observer(() => {
  const { exchange, user } = useStores();

  if (!exchange.operation) {
    return null;
  }

  const status = exchange.operation.status;
  console.log(exchange.txHash);
  return (
    <Box direction="column" className={styles.stepsContainer}>
      <StepRow
        key={status}
        status={status}
        srcTransactionHash={exchange.txHash}
        type={exchange.mode}
      />
    </Box>
  );
});
