import { useQuery, gql, QueryResult } from '@apollo/client';
import React, { useState } from 'react';
import { SubgraphComponentProp } from 'interfaces';
import { client_eth, client_bsc } from '../clients/clients';
import { Spinner } from 'ui';
import { NETWORK_TYPE } from 'stores/interfaces';
import { Box } from 'grommet';
import { formatWithTwoDecimals } from 'utils';
import { Title } from 'components/Base';

export function SubgraphNumericQueryRunner(
  props: SubgraphComponentProp,
) {
  
  let queryResult: QueryResult;
  if (client_eth && props.network === NETWORK_TYPE.ETHEREUM) {
    queryResult = useQuery(
      gql`
        ${props.query}
      `,
      {
        client: client_eth,
      },
    );
  } else if (client_bsc && props.network === NETWORK_TYPE.BINANCE) {
    queryResult = useQuery(
      gql`
        ${props.query}
      `,
      {
        client: client_bsc,
      },
    );
  } else {
    queryResult = useQuery(
      gql`
        ${props.query}
      `,
    );
  }
  let number = 0;

  if (
    queryResult.data != undefined &&
    queryResult.data.hasOwnProperty('wallets')
  ) {
    let wallets = queryResult.data.wallets[0];
    switch (props.dataType) {
      case 'transactionsCount':
        number = wallets.transactionsCount;
        break;
      case 'eventsCount':
        number = wallets.eventsCount;
        break;
      case 'usersCount':
        number = wallets.usersCount;
        break;
      case 'assetsCount':
        number = wallets.assetsCount;
        break;

      case 'avgTransactionFee':
        number = wallets.avgTransactionFee;
        break;
    }
  }
  // console.log(queryResult.data);
  if (queryResult.loading)
    return (
      <Box direction="column" pad={{ left: '20px' }}>
        <Title size="small">
          {props.title}
          <span
            style={{
              marginLeft: 5,
              color: '#47b8eb',
              fontWeight: 600,
              letterSpacing: 0.2,
            }}
          >
            Loading...
          </span>
        </Title>
      </Box>
    );
  return (
    <Box
      direction="column"
      justify="center"
      alignContent="center"
      pad={{ left: '20px' }}
    >
      <Title size="small">
        {props.title}
        <span
          style={{
            marginLeft: 5,
            color: '#47b8eb',
            fontWeight: 600,
            letterSpacing: 0.2,
          }}
        >
          {formatWithTwoDecimals(number)}
        </span>
      </Title>
    </Box>
  );
}

export default SubgraphNumericQueryRunner;
