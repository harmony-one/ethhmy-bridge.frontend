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
import { SwapStatus } from '../../constants';

const StepRow = ({
  status,
  srcTransactionHash,
  dstTransactionHash,
  type,
  txId
}: {
  status: number;
  srcTransactionHash: string;
  dstTransactionHash?: string;
  type: EXCHANGE_MODE;
  txId?: string
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
        {label} {status === SwapStatus.SWAP_WAIT_SEND ? `from ${WalletType[type]}` : null}
      </Text>
      <Text className={textClassName}>
        {txId ? `Your transaction ID is: ${txId}` : null }
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

const StatusDescription: Record<SwapStatus, string> = {
  [SwapStatus.SWAP_UNSIGNED]: 'Bridge confirmed Transaction, waiting for Signatures',
  [SwapStatus.SWAP_SIGNED]: 'Bridge Transaction Signed, waiting for broadcast',
  [SwapStatus.SWAP_SUBMITTED]: 'Bridge Transaction Sent, waiting for confirmation',
  [SwapStatus.SWAP_CONFIRMED]: 'Transfer Complete!',
  [SwapStatus.SWAP_FAILED]: 'Transfer failed!',
  [SwapStatus.SWAP_RETRY]: 'Failed to broadcast transaction. Retrying...',
  [SwapStatus.SWAP_SENT]: 'Sent Transaction... waiting for on-chain confirmation',
  [SwapStatus.SWAP_WAIT_SEND]: 'Waiting for user transaction ',
  [SwapStatus.SWAP_WAIT_APPROVE]: 'Waiting for allowance',
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
        txId={exchange.operation.id}
      />
    </Box>
  );
});
