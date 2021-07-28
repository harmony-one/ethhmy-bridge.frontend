import React from 'react';
import { SubgraphNumericQueryRunner } from 'components/Subgraph';
import { BaseContainer, PageContainer } from 'components';
import { Box } from 'grommet';

export const Analytics = (props: any) => {
  return (
    <BaseContainer>
      <PageContainer>
        <Box
          direction="row"
          justify="between"
          width="560px"
          margin={{ vertical: 'large' }}
        >
          <SubgraphNumericQueryRunner
            query={`
                {
                assets(orderBy: eventsCount, orderDirection: desc) {
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
                }
                `}
          />
        </Box>
      </PageContainer>
    </BaseContainer>
  );
};
