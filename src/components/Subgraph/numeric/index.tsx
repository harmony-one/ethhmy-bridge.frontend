import { useQuery, gql, QueryResult } from '@apollo/client';
import React, { useState } from 'react';
import { SubgraphNumericComponentProp } from 'interfaces';
import { Spinner } from 'ui';
import { Box } from 'grommet';
import { formatWithTwoDecimals } from 'utils';
import { Title } from 'components/Base';

export function SubgraphNumericQueryRunner(
  props: SubgraphNumericComponentProp,
) {
  const queryResult: QueryResult = useQuery(
    gql`
      ${props.query}
    `,
  );
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
    <Box direction="column" justify='center' alignContent='center' pad={{ left: '20px' }}>
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
