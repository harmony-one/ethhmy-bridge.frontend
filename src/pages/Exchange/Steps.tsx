import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { Text } from 'components/Base';
import { Error } from 'ui';
import cn from 'classnames';
import * as styles from './feeds.styl';
import { useStores } from 'stores';
import { IAction, STATUS } from 'stores/interfaces';
import { dateTimeFormat, truncateAddressString } from '../../utils';
import { STEPS_TITLE } from './steps-constants';

const StepRow = ({ action, number }: { action: IAction; number: number }) => {
  const active = action.status === STATUS.IN_PROGRESS;
  const completed = action.status === STATUS.SUCCESS;

  const label = STEPS_TITLE[action.type] || action.type;

  const textClassName = cn(
    styles.stepRow,
    active ? styles.active : '',
    completed ? styles.completed : '',
  );

  const explorerUrl =
    (isEth(action.type)
      ? process.env.ETH_EXPLORER_URL
      : process.env.HMY_EXPLORER_URL) + '/tx/';

  return (
    <Box
      direction="column"
      style={{ borderBottom: '1px solid #dedede' }}
      margin={{ bottom: 'medium' }}
    >
      <Text className={textClassName}>{number + 1 + '. ' + label}</Text>
      <Box direction="row" justify="between">
        <Text className={textClassName}>Status: {statuses[action.status]}</Text>
        {action.timestamp && (
          <Text className={textClassName}>
            {dateTimeFormat(action.timestamp * 1000)}
          </Text>
        )}
      </Box>
      {action.transactionHash && (
        <Text className={textClassName}>
          Tx hash:{' '}
          <a href={explorerUrl + action.transactionHash} target="_blank">
            {truncateAddressString(action.transactionHash)}
          </a>
        </Text>
      )}
      {action.message && (
        <Text className={textClassName}>{action.message}</Text>
      )}
      {action.error && <Error error={action.error} />}
    </Box>
  );
};

const isEth = type =>
  [
    'approveEthManger',
    'lockToken',
    'unlockToken',
    'unlockTokenRollback',
  ].includes(type);

const statuses: Record<STATUS, string> = {
  waiting: 'Waiting',
  success: 'Success',
  in_progress: 'In progress',
  error: 'Error',
};

export const Steps = observer(() => {
  const { exchange } = useStores();

  if (!exchange.operation) {
    return null;
  }

  const steps = exchange.operation.actions;

  return (
    <Box direction="column" className={styles.stepsContainer}>
      {steps.map((action, idx) => (
        <StepRow key={action.id} action={action} number={idx} />
      ))}
    </Box>
  );
});
