import { useQuery, gql, QueryResult } from '@apollo/client';
import React, { Component } from 'react';
import {SubgraphNumericComponentProp} from 'interfaces';

export class SubgraphNumericQueryRunner extends Component<SubgraphNumericComponentProp> {
  query: string;
  queryResult: QueryResult;

  constructor(props){
    super(props);
    this.query = gql`${props.query}`;
    this.queryResult = useQuery(this.query);
  }
  render() {
    if (this.queryResult.loading) return <p>Loading...</p>;
    if (this.queryResult.error) return <p>Error :(</p>;
    console.log(this.queryResult.data);
    return <>
        Success
    </>;
  }
}

export default SubgraphNumericQueryRunner;
