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
                  assets(first: 1000){
                    id
                    symbol
                    eventsCount
                  }
                }
                `}
            />
          </Box>
          <Box direction="column">
            <SubgraphNumericQueryRunner
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
        </Box>

        <Box direction="column" justify="between" margin={{ vertical: 'large' }}>
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
