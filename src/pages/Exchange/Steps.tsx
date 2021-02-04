import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { Text } from 'components/Base';
import cn from 'classnames';
import * as styles from './feeds.styl';
import { useStores } from 'stores';
import { EXCHANGE_MODE } from 'stores/interfaces';
import { SwapStatus } from '../../constants';

console.log(styles);

const ProgressBar = ({ status }) => {
  const statusProgress = {
    [SwapStatus.SWAP_WAIT_SEND]: 33,
    [SwapStatus.SWAP_SENT]: 66,
    [SwapStatus.SWAP_CONFIRMED]: 100
  }
  return (
    <>
      <div className={styles.progress}>
        <div className={styles.bar} style={{ width: `${statusProgress[status]}%` }}></div>
      </div>
    </>
  )
}

const StepNumber = ({ step, isActive }) => {
  return (
    <>
      <div className={ isActive ? [styles.stepNumber, styles.stepNumberActive].join(' ') : styles.stepNumber }>{step}</div>
    </>
  )
}

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
  const label = StatusDescription[status];

  const textStyle =
    status === SwapStatus.SWAP_FAILED ? styles.failed : styles.active;

  const textClassName = cn(styles.stepRow, textStyle);

  return (
    <Box
      direction="column"
      margin={{ bottom: 'medium' }}
    >
      <h3>Loading your bridge transaction...</h3>

      <ProgressBar status={status}/>

      <StepNumber step={1} isActive={status === SwapStatus.SWAP_WAIT_SEND}></StepNumber>

      <h4>{WalletTypeMessages[type].firstStep}</h4>
      <p>{srcTransactionHash ? `Your TX ID is: ${srcTransactionHash}` : null}</p>

      <StepNumber step={2} isActive={status === SwapStatus.SWAP_SENT}></StepNumber>
      <h4>Wait for 6 blocks</h4>
      <p>The waiting period is required to ensure finality</p>

      <StepNumber step={3} isActive={status === SwapStatus.SWAP_CONFIRMED}></StepNumber>
      <h4>{WalletTypeMessages[type].lastStep}</h4>
    </Box>
  );
};

const WalletType: Record<EXCHANGE_MODE, string> = {
  [EXCHANGE_MODE.ETH_TO_SCRT]: 'Metamask',
  [EXCHANGE_MODE.SCRT_TO_ETH]: 'Keplr',
};

const WalletTypeMessages: Record<EXCHANGE_MODE, any> = {
  [EXCHANGE_MODE.ETH_TO_SCRT]: {
    firstStep: 'Ethereum transaction [pending / confirmed]',
    lastStep: 'Secret Network transaction [pending / confirmed]'
  },
  [EXCHANGE_MODE.SCRT_TO_ETH]: {
    firstStep: 'Secret Network transaction [pending / confirmed]',
    lastStep: 'Ethereum multisig transaction [broadcasted/ pending / confirmed]'
  },
};

const StatusDescription: Record<SwapStatus, string> = {
  [SwapStatus.SWAP_UNSIGNED]:
    'Bridge confirmed transaction, waiting for Signatures',
  [SwapStatus.SWAP_SIGNED]: 'Bridge transaction signed, waiting for broadcast',
  [SwapStatus.SWAP_SUBMITTED]:
    'Bridge transaction sent, waiting for confirmation',
  [SwapStatus.SWAP_CONFIRMED]: 'Transfer complete!',
  [SwapStatus.SWAP_FAILED]:
    'Transfer failed! Please go to #🌉bridge-support on https://chat.scrt.network for more details and specify your operation ID.',
  [SwapStatus.SWAP_RETRY]: 'Failed to broadcast transaction. Retrying...',
  [SwapStatus.SWAP_SENT]:
    'Sent Transaction... waiting for on-chain confirmation',
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
