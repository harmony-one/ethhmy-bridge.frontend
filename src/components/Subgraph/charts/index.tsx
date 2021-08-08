import { useQuery, gql, QueryResult } from '@apollo/client';
import React, { useState } from 'react';
import { SubgraphNumericComponentProp } from 'interfaces';
import { Box, Card } from 'grommet';
import { Button } from 'components/Base';
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
  value = { ...value, day: numericDay, formatedDate: formatDate(d).join('-') };
  return value;
}

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day];
}

export function SubgraphDataChart(props: SubgraphNumericComponentProp) {
  /* if this is equal to year the data will be filtered based on year and 
     if its equal to month then the data will be filtered based on month 
     Consider the year and month are hardcoded in this version also some
     part of this component need improvement in the later versions 
  */

  const [fetchDate, setFetchDate] = useState('year');

  /* Executing the GraphQL query for the chart */
  const queryResult: QueryResult = useQuery(
    gql`
      ${props.query}
    `,
  );
  let chartData = [];
  if (queryResult.data != undefined) {
    // console.log('chart data', queryResult.data);
    let transactions = queryResult.data.transactions;
    transactions = transactions.filter(item => {
      // consider this array contains year,month and day
      let dateArray = formatDate(item['timestamp'] * 1000);
      switch (fetchDate) {
        case 'year':
          return dateArray[0] === new Date().getFullYear();
        case 'month':
          let month = new Date().getMonth();
          let monthStr = ('' + month).length < 2 ? '0' + month : month;
          return dateArray[1] === monthStr;
        default:
          return false;
      }
    });

    const dailyTransactions = transactions.map(groupday);
    let grouped = _.groupBy(dailyTransactions, 'day');

    for (let i in grouped) {
      chartData.push({
        name: grouped[i][0].formatedDate,
        txCount: grouped[i].length,
      });
    }

    // console.log(chartData);
  }

  if (queryResult.loading)
    return (
      <Box
        fill={true}
        background="white"
        pad={{ horizontal: '9px', vertical: '9px' }}
        justify="center"
        align="center"
        style={{ minHeight: '300px' }}
      >
        <Box background="white" pad={{ horizontal: '9px', vertical: '9px' }}>
          <Spinner />
        </Box>
      </Box>
    );
  return (
    <Box fill={true} background="white" pad="large">
      <Box
        direction="row"
        justify="end"
        pad={{ horizontal: 'large' }}
        gap="10px"
        fill={true}
      >
        <Button
          style={{
            background: 'white',
            border:
              fetchDate === 'year'
                ? '2px solid #00ADE8'
                : '2px solid rgba(0,0,0,0)',
            color: '#212e5e',
            padding: '1px',
          }}
          onClick={() => setFetchDate('year')}
        >
          1/y
        </Button>
        <Button
          style={{
            background: 'white',
            border:
              fetchDate === 'month'
                ? '2px solid #00ADE8'
                : '2px solid rgba(0,0,0,0)',
            color: '#212e5e',
            padding: '1px',
          }}
          onClick={() => setFetchDate('month')}
        >
          1/m
        </Button>
      </Box>
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
    </Box>
  );
}

export function SubgraphAssetChart(props: SubgraphNumericComponentProp) {
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
      <Box
        fill={true}
        background="white"
        pad={{ horizontal: '9px', vertical: '9px' }}
        justify="center"
        align="center"
        style={{ minHeight: '300px' }}
      >
        <Box background="white" pad={{ horizontal: '9px', vertical: '9px' }}>
          <Spinner />
        </Box>
      </Box>
    );
  return (
    <Box fill={true} background="white" pad="large">
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
    </Box>
  );
}
