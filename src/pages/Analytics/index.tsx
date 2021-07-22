import React from 'react';
import { SubgraphNumericQueryRunner } from 'components/Subgraph';
import { BaseContainer, PageContainer } from 'components';

export const Analytics = (props: any) => {
  return (
    <BaseContainer>
      <PageContainer>
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
      </PageContainer>
    </BaseContainer>
  );
};
