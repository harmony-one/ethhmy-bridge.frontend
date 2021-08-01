import React from 'react';
import { SubgraphNumericQueryRunner } from 'components/Subgraph/numeric';
import { SubgraphDataChart } from 'components/Subgraph/charts';
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
                  assets(first: 1000){
                    id
                    symbol
                    eventsCount
                  }
                }
                `}
          />
        </Box>
      </PageContainer>
    </BaseContainer>
  );
};
