import { default as React } from 'react';
import { Box } from 'grommet';
import { Text } from 'components/Base';
import { observer } from 'mobx-react-lite';
import { IOperation } from 'stores/interfaces';
import * as styles from './styles.styl';
import cn from 'classnames';
import { dateTimeAgoFormat, truncateAddressString } from 'utils';
import { STEPS_TITLE } from './steps-constants';

export interface IExpandedRowProps {
  data: IOperation;
}

const isEth = type =>
  ['approveEthManger', 'lockToken', 'unlockToken'].includes(type);

export const ExpandedRow = observer((props: IExpandedRowProps) => {
  return (
    <Box pad={{ bottom: 'small', horizontal: 'large' }} direction="column">
      {props.data.actions.map(action => (
        <Box direction="column" margin={{ top: 'small' }} key={action.id}>
          <Box direction="row" align="center">
            <Box
              className={cn(styles.actionCell, styles.type)}
              style={{ width: '300px' }}
            >
              {STEPS_TITLE[action.type]}
            </Box>
            <Box
              className={cn(styles.status, styles[action.status])}
              margin={{ right: '25px' }}
            >
              {action.status}
            </Box>
            <Box
              className={styles.actionCell}
              style={{ width: 240 }}
              align="center"
            >
              <a
                className={styles.addressLink}
                href={
                  (isEth(action.type)
                    ? process.env.ETH_EXPLORER_URL
                    : process.env.HMY_EXPLORER_URL) +
                  '/tx/' +
                  action.transactionHash
                }
                target="_blank"
              >
                {truncateAddressString(action.transactionHash, 10)}
              </a>
            </Box>
            <Box className={styles.actionCell} style={{ width: 180 }}>
              {dateTimeAgoFormat(action.timestamp)}
            </Box>
          </Box>
          {action.error ? <Text color="red">{action.error}</Text> : null}
        </Box>
      ))}
    </Box>
  );
});
