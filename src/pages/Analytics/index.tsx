import React from 'react';
import { SubgraphNumericQueryRunner } from 'components/Subgraph/numeric';
import { SubgraphDataChart, SubgraphAssetChart } from 'components/Subgraph/charts';
import { SubGraphQueryTable } from 'components/Subgraph/tables';
import { BaseContainer, PageContainer } from 'components';
import { Box } from 'grommet';

export const Analytics = (props: any) => {
  return (
    <BaseContainer>
      <PageContainer>
        <Box direction="row" justify="start" margin={{ vertical: 'large' }}>
          <Box direction="column">
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
          <Box direction="column">
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

          <Box direction="column">
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
          direction="column"
          justify="between"
          margin={{ vertical: 'large' }}
        >
          <SubgraphDataChart
            query={`
               {
                  transactions(skip: 1000, orderBy: timestamp, orderDirection: asc){
                    id
                    timestamp
                  }
                }
                `}
          />
        </Box>
        <Box
          direction="column"
          justify="between"
          margin={{ vertical: 'large' }}
        >
          <SubgraphAssetChart
            query={`
               {
                  assets(first: 1000){
                    id
                    symbol
                    eventsCount
                  }
                }
                `}
          />
        </Box>
         <Box
          direction="column"
          justify="between"
          margin={{ vertical: 'large' }}
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
                        totalLocked
                      }
                      ... on BridgedToken {
                        mintsCount
                        burnsCount
                        totalLocked
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
