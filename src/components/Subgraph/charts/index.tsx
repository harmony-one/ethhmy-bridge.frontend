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
var _ = require('lodash');

function groupday(value, index, array) {
  let d = new Date(value['timestamp'] * 1000);
  let numericDay = Math.floor(d.getTime() / (1000 * 60 * 60 * 24));
  value = { ...value, day: numericDay, formatedDate: formatDate(d) };
  return value;
}

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

export function SubgraphDataChart(props: SubgraphNumericComponentProp) {
  const queryResult: QueryResult = useQuery(
    gql`
      ${props.query}
    `,
  );
  let chartData = [];
  if (queryResult.data != undefined) {
    // console.log('chart data', queryResult.data);
    let transactions = queryResult.data.transactions;
    const dailyTransactions = transactions.map(groupday);
    let grouped = _.groupBy(dailyTransactions, 'day');

    for (let i in grouped) {
      chartData.push({
        name: grouped[i][0].formatedDate,
        txCount: grouped[i].length,
      });
    }

    console.log(chartData);
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
          <Bar dataKey="txCount" name="Daily transactions" fill="#00ADE8" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
