import { default as React } from 'react';
import { Box } from 'grommet';
import { Text } from 'components/Base';
import { observer } from 'mobx-react-lite';
import { IOperation } from 'stores/interfaces';
import * as styles from './styles.styl';
import cn from 'classnames';

export interface IExpandedRowProps {
  data: IOperation;
}

export const ExpandedRow = observer((props: IExpandedRowProps) => {
  return (
    <Box pad={{ bottom: 'small', horizontal: 'large' }} direction="column">
      {props.data.actions.map(action => (
        <Box direction="column" margin={{ top: 'small' }} key={action.id}>
          <Box direction="row">
            <Box className={cn(styles.actionCell, styles.type)}>
              {action.type}
            </Box>
            <Box className={styles.actionCell}>{action.status}</Box>
            <Box className={styles.actionCell}>{action.transactionHash}</Box>
            <Box className={styles.actionCell}>{action.timestamp}</Box>
          </Box>
          {action.error ? <Text color="red">{action.error}</Text> : null}
        </Box>
      ))}
    </Box>
  );
});
