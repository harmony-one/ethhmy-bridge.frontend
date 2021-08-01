import { useQuery, gql, QueryResult } from '@apollo/client';
import React from 'react';
import { SubgraphNumericComponentProp } from 'interfaces';
import { Spinner } from 'ui';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { Text } from 'components/Base';
import * as styles from './styles.styl';
import cn from 'classnames';

const NumericDataCard = observer((props: { title: string; amount: string }) => {
  const { exchange } = useStores();

  const isEthereumNetwork = true;

  return (
    <Box
      direction="column"
      align="center"
      justify="center"
      gap="10px"
      className={cn(styles.numericStaticContainer, styles.active)}
    >
      <Text size="large" className={styles.title}>
        {isEthereumNetwork ? 'ETH' : 'Binance'}
      </Text>

      <Text size="small" color="#748695" className={styles.description}>
        {props.amount}
      </Text>
    </Box>
  );
});

export function SubgraphNumericQueryRunner(
  props: SubgraphNumericComponentProp,
) {
  const queryResult: QueryResult = useQuery(
    gql`
      ${props.query}
    `,
  );
  // console.log(queryResult.data);
  if (queryResult.loading)
    return (
     <Box
      direction="column"
      align="center"
      justify="center"
      gap="10px"
      className={cn(styles.numericStaticContainer, styles.active)}
    >
        <Spinner />
      </Box>
    );
  return (
    <NumericDataCard
      title="ETH -> ONE"
      amount="(Metamask)"
    />
  );
}

export default SubgraphNumericQueryRunner;
