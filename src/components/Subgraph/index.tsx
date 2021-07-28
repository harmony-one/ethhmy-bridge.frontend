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

const LargeButton = observer(
  (props: {
    title: string;
    description: string;
    isActive: boolean;
    reverse?: boolean;
  }) => {
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
        <Box direction={props.reverse ? 'row-reverse' : 'row'} align="center">
          <Box direction="row" align="center">
            <img
              className={styles.imgToken}
              src={isEthereumNetwork ? '/eth.svg' : '/binance.png'}
            />
            <Text size="large" className={styles.title}>
              {isEthereumNetwork ? 'ETH' : 'Binance'}
            </Text>
          </Box>
          <Box direction="row" margin={{ horizontal: 'medium' }} align="center">
            <img src="/right.svg" />
          </Box>
          <Box direction="row" align="center">
            <img className={styles.imgToken} src="/one.svg" />
            <Text size="large" className={styles.title}>
              ONE
            </Text>
          </Box>
        </Box>
        <Text size="xsmall" color="#748695" className={styles.description}>
          {props.description}
        </Text>
      </Box>
    );
  },
);

export function SubgraphNumericQueryRunner(
  props: SubgraphNumericComponentProp,
) {
  const queryResult: QueryResult = useQuery(
    gql`
      ${props.query}
    `,
  );
  console.log(queryResult.data);
  if (queryResult.loading)
    return (
      <Box
        direction="column"
        align="center"
        className={cn(styles.spinnerContainer)}
      >
        <Spinner />
      </Box>
    );
  return (
    <LargeButton title="ETH -> ONE" description="(Metamask)" isActive={true} />
  );
}

export default SubgraphNumericQueryRunner;
