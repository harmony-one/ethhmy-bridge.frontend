import React, { useState } from 'react';
import { SubgraphNumericQueryRunner } from 'components/Subgraph/numeric';
import {
  SubgraphDataChart,
  SubgraphAssetChart,
} from 'components/Subgraph/charts';
import { SubGraphQueryTable } from 'components/Subgraph/tables';
import { BaseContainer, PageContainer } from 'components';
import { SearchInput } from 'components/Search';
import { Button } from 'components/Base';
import { NETWORK_TYPE } from 'stores/interfaces';
import { NETWORK_ICON, NETWORK_NAME } from '../../stores/names';
import { ChartType } from '../../interfaces/subgraphTypes';
import { Box } from 'grommet';

export const Analytics = (props: any) => {
  const [network, setNetwork] = useState(NETWORK_TYPE.ETHEREUM);

  function handleNetworkChange(type: NETWORK_TYPE) {
    setNetwork(type);
  }

  return (
    <BaseContainer>
      <PageContainer>
        {/* 
         this are networks switch button that needs to be added 
        <Box
          direction="column"
          fill={true}
          justify="center"
          alignContent="center"
          align="center"
          margin={{ top: 'small', bottom: 'small' }}
        >
          <Box direction="row" justify="start" gap="10px">
            <Button
              style={{
                background: 'white',
                border:
                  network === NETWORK_TYPE.BINANCE
                    ? '2px solid #00ADE8'
                    : '2px solid rgba(0,0,0,0)',
                color: '#212e5e',
              }}
              onClick={() => handleNetworkChange(NETWORK_TYPE.BINANCE)}
            >
              <img
                style={{ marginRight: 10, height: 20 }}
                src={NETWORK_ICON[NETWORK_TYPE.BINANCE]}
              />
              {NETWORK_NAME[NETWORK_TYPE.BINANCE]}
            </Button>
            <Button
              style={{
                background: 'white',
                border:
                  network === NETWORK_TYPE.ETHEREUM
                    ? '2px solid #00ADE8'
                    : '2px solid rgba(0,0,0,0)',
                color: '#212e5e',
              }}
              onClick={() => handleNetworkChange(NETWORK_TYPE.ETHEREUM)}
            >
              <img
                style={{ marginRight: 10, height: 20 }}
                src={NETWORK_ICON[NETWORK_TYPE.ETHEREUM]}
              />
              {NETWORK_NAME[NETWORK_TYPE.ETHEREUM]}
            </Button>
          </Box>
        </Box> */}
        <Box
          direction="row"
          justify="center"
          alignContent="center"
          margin={{ vertical: 'small' }}
        >
          <Box direction="column" margin={{ vertical: 'large' }}>
            <SubgraphNumericQueryRunner
              query={`
                  {
                    wallets(first:100){
                      id
                      transactionsCount
                      eventsCount
                      usersCount
                      assetsCount
                    }
                  }
                `}
              title="Total asset bridged"
              dataType="assetsCount"
            />
          </Box>
          <Box direction="column" margin={{ vertical: 'large' }}>
            <SubgraphNumericQueryRunner
              query={`
                  {
                    wallets(first:100){
                      id
                      transactionsCount
                      eventsCount
                      usersCount
                      assetsCount
                    }
                  }
                `}
              title="Total bridge transaction count"
              dataType="transactionsCount"
            />
          </Box>

          <Box direction="column" margin={{ vertical: 'large' }}>
            <SubgraphNumericQueryRunner
              query={`
                  {
                    wallets(first:100){
                      id
                      transactionsCount
                      eventsCount
                      usersCount
                      assetsCount
                    }
                  }
                `}
              title="Number of unique bridge accounts"
              dataType="usersCount"
            />
          </Box>
        </Box>
        <Box
          direction="row"
          justify="center"
          alignContent="center"
          margin={{ vertical: 'small' }}
        >
          <SubgraphNumericQueryRunner
            query={`
                  {
                    wallets{
                      usersCount
                      eventsCount
                      assetsCount
                      totalTransactionFee
                      avgTransactionFee
                      transactionsCount
                      transactionsConfirmedCount
                      transactionsExecutedCount
                    }
                  }
                `}
            title="Average Transaction Fee"
            dataType="avgTransactionFee"
          />
        </Box>
        <Box
          direction="row"
          justify="center"
          alignContent="center"
          margin={{ vertical: 'small' }}
        >
          <SubgraphDataChart
            query={`
                {
                    walletDayDatas{
                      id
                      transactionsCount
                      newUsersCount
                      newAssetsCount
                      eventsCount
                      totalTransactionFee
                      avgTransactionFee
                    }
                  }
                `}
            chartType={ChartType.WALLET_DAILY}
            showDateFilter={false}
          />
        </Box>

        <Box direction="row" justify="between" margin={{ vertical: 'small' }}>
          <SubgraphDataChart
            query={`
               {
                  transactions(skip: 300, orderBy: timestamp, orderDirection: asc){
                    id
                    timestamp
                  }
                }
                `}
            chartType={ChartType.TRANSACTION}
            showDateFilter={true}
          />
        </Box>

        <Box
          direction="column"
          justify="between"
          margin={{ vertical: 'small' }}
        >
          <SubGraphQueryTable
            query={`{
                    assets(orderBy: eventsCount, orderDirection: desc, where: {network: %network%}) {
                      id
                      symbol
                      network
                      address
                      mappedAddress
                      eventsCount
                      ... on Token {
                        locksCount
                        unlocksCount
                        volume
                      }
                      ... on BridgedToken {
                        mintsCount
                        burnsCount
                        volume
                      }
                      ... on BridgedNFT {
                        mintsCount
                        burnsCount
                        inventory
                      }
                    }
                  }`}
                  
          />
        </Box>
      </PageContainer>
    </BaseContainer>
  );
};
