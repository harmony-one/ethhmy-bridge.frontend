import * as React from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { Text } from 'components/Base';
import cn from 'classnames';
import * as styles from './feeds.styl';
import { useStores } from 'stores';

const StepRow = ({ active, label, completed, number }) => {
  return (
    <Text
      className={cn(
        styles.stepRow,
        active ? styles.active : '',
        completed ? styles.completed : '',
      )}
    >
      {number + 1 + '. ' + label}
    </Text>
  );
};

export const Steps = observer(() => {
  const { exchange } = useStores();

  const steps = exchange.actionSteps[exchange.currentAction];

  return (
    <Box direction="column" className={styles.stepsContainer}>
      {steps.map((value, idx) => (
        <StepRow
          key={idx}
          label={value}
          active={exchange.currentActionStep === idx}
          completed={exchange.currentActionStep > idx}
          number={idx}
        />
      ))}
    </Box>
  );
});
