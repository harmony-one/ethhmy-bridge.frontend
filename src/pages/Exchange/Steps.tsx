import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { Text } from 'components/Base';
import cn from 'classnames';
import * as styles from './feeds.styl';
import { useStores } from 'stores';
import { EXCHANGE_MODE } from 'stores/interfaces';
import { SwapStatus } from '../../constants';

const StepRow = ({
  status,
  srcTransactionHash,
  dstTransactionHash,
  type,
  txId,
}: {
  status: number;
  srcTransactionHash: string;
  dstTransactionHash?: string;
  type: EXCHANGE_MODE;
  txId?: string;
}) => {
  const label = StatusDescription[status]; //STEPS_TITLE[status];

  const textStyle = status === SwapStatus.SWAP_FAILED ? styles.failed : styles.active;

  const textClassName = cn(styles.stepRow, textStyle);

  return (
    <Box direction="column" style={{ borderBottom: '1px solid #dedede' }} margin={{ bottom: 'medium' }}>
      <Text className={textClassName}>
        {status !== SwapStatus.SWAP_FAILED && status !== SwapStatus.SWAP_CONFIRMED
          ? `Your transaction is in progress. This process may take a few minutes...`
          : null}
      </Text>

      <Box direction="row" justify="between">
        {' '}
      </Box>

      <Text className={textClassName}>
        {label} {status === SwapStatus.SWAP_WAIT_SEND ? `from ${WalletType[type]}` : null}
      </Text>
      <Text className={textClassName}>{txId ? `Your transaction ID is: ${txId}` : null}</Text>
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
  [SwapStatus.SWAP_UNSIGNED]: 'Bridge confirmed transaction, waiting for Signatures',
  [SwapStatus.SWAP_SIGNED]: 'Bridge transaction signed, waiting for broadcast',
  [SwapStatus.SWAP_SUBMITTED]: 'Bridge transaction sent, waiting for confirmation',
  [SwapStatus.SWAP_CONFIRMED]: 'Transfer complete!',
  [SwapStatus.SWAP_FAILED]:
    'Transfer failed! Please go to #🌉bridge-support on https://chat.scrt.network for more details and specify your operation ID.',
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
