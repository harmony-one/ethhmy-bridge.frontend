import { useQuery, gql, QueryResult } from '@apollo/client';
import React, {useState} from 'react';
import { SubgraphNumericComponentProp } from 'interfaces';
import { Spinner } from 'ui';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { Text } from 'components/Base';
import * as styles from './styles.styl';
import cn from 'classnames';


export function SubgraphNumericQueryRunner(
  props: SubgraphNumericComponentProp,
) {
  
  const queryResult: QueryResult = useQuery(
    gql`
      ${props.query}
    `,
  );
  let number = 0; 
  if(queryResult.data != undefined && queryResult.data.hasOwnProperty('wallets')){
    let wallets = queryResult.data.wallets[0];
    switch(props.dataType){
      case "transactionsCount":
        number = wallets.transactionsCount;
        break;
      case "eventsCount":
        number = wallets.eventsCount;
        break;
      case "usersCount":
        number = wallets.usersCount;
        break;
      case "assetsCount":
        number= wallets.assetsCount;
        break;
    }
  }
  console.log(queryResult.data);
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
   <Box
      direction="column"
      align="center"
      justify="center"
      gap="10px"
      className={cn(styles.numericStaticContainer, styles.active)}
    >
      <Text size="large" className={styles.title}>
        {props.title}
      </Text>

      <Text size="small" color="#748695" className={styles.description}>
        {number}
      </Text>
    </Box>
  );
}

export default SubgraphNumericQueryRunner;
