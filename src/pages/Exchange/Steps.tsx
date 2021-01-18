import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { Text } from 'components/Base';
import { Error } from 'ui';
import cn from 'classnames';
import * as styles from './feeds.styl';
import { useStores } from 'stores';
import { ACTION_TYPE, IAction, STATUS, TOKEN } from 'stores/interfaces';
import { dateTimeFormat, truncateAddressString } from '../../utils';
import { getStepsTitle } from './steps-constants';

const StepRow = ({
  action,
  active,
  number,
  hrc20Address,
  token,
}: {
  action: IAction;
  hrc20Address?: string;
  number: number;
  active: boolean;
  token: TOKEN;
}) => {
  const completed = action.status === STATUS.SUCCESS;

  const label = getStepsTitle(action.type, token) || action.type;

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
      {action.transactionHash && action.transactionHash !== 'skip' ? (
        <Box direction="row" justify="between">
          <Text className={textClassName}>Tx hash: </Text>
          <a href={explorerUrl + action.transactionHash} target="_blank">
            {truncateAddressString(action.transactionHash, 10)}
          </a>
        </Box>
      ) : null}

      {action.transactionHash && action.transactionHash === 'skip' ? (
        <Box direction="row" justify="between">
          <Text className={textClassName}>Operation was skipped</Text>
        </Box>
      ) : null}

      {hrc20Address && (
        <Box
          direction="row"
          justify="between"
          align="center"
          className={textClassName}
        >
          <Box direction="row" align="center">
            <img
              className={styles.imgToken}
              style={{ height: 18 }}
              src="/one.svg"
            />
            <Text>HRC20 address:</Text>
          </Box>
          <Box>
            <a
              href={process.env.HMY_EXPLORER_URL + '/address/' + hrc20Address}
              target="_blank"
            >
              {truncateAddressString(hrc20Address, 10)}
            </a>
          </Box>
        </Box>
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
    'waitingBlockNumber',

    // HRC20
    'approveHRC20EthManger',
    'getERC20Address',
    'burnHRC20Token',
    'mintHRC20Token',
    'mintHRC20TokenRollback',
  ].includes(type);

const statuses: Record<STATUS, string> = {
  waiting: 'Waiting',
  success: 'Success',
  in_progress: 'In progress',
  error: 'Error',
};

export const Steps = observer(() => {
  const { exchange, user } = useStores();

  if (!exchange.operation) {
    return null;
  }

  const steps = exchange.operation.actions;

  return (
    <Box direction="column" className={styles.stepsContainer}>
      {steps.map((action, idx) => (
        <StepRow
          key={action.id}
          action={action}
          number={idx}
          token={exchange.operation.token}
          active={
            action.status === STATUS.IN_PROGRESS ||
            (action.status === STATUS.WAITING &&
              (!!idx ? steps[idx - 1].status === STATUS.SUCCESS : true))
          }
          hrc20Address={
            action.type === ACTION_TYPE.getHRC20Address ? user.hrc20Address : ''
          }
        />
      ))}
    </Box>
  );
});
