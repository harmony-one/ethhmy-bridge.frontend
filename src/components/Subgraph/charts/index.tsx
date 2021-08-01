import { useQuery, gql, QueryResult } from '@apollo/client';
import React from 'react';
import { SubgraphNumericComponentProp } from 'interfaces';
import { Box, Card } from 'grommet';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
} from 'recharts';
import { Spinner } from 'ui';

export function SubgraphDataChart(props: SubgraphNumericComponentProp) {
  const queryResult: QueryResult = useQuery(
    gql`
      ${props.query}
    `,
  );
  let chartData = [];
  if (queryResult.data != undefined) {
    let assets = queryResult.data.assets;
    for (let index in assets) {
      let item = assets[index];
      chartData.push({
        name: item['symbol'],
        txCount: parseInt(item.eventsCount),
      });
    }
  }

  if (queryResult.loading)
    return (
      <Card
        fill={true}
        background="white"
        pad={{ horizontal: '9px', vertical: '9px' }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <Spinner />
        </ResponsiveContainer>
      </Card>
    );
  return (
    <Card
      fill={true}
      background="white"
      pad={{ horizontal: '9px', vertical: '9px' }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="txCount" fill="#00ADE8" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
