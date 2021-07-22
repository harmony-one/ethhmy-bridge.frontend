import { useQuery, gql, QueryResult } from '@apollo/client';
import React, { Component } from 'react';
import { DocumentNode } from 'graphql';
import { SubgraphNumericComponentProp } from 'interfaces';
import { ApolloConsumer } from '@apollo/client';

export function SubgraphNumericQueryRunner(
  props: SubgraphNumericComponentProp,
) {
  const queryResult: QueryResult = useQuery(
    gql`
      ${props.query}
    `,
  );
  if (queryResult.loading) return <p>Loading ...</p>;
  return <h1>Succesd</h1>;
}

export default SubgraphNumericQueryRunner;
