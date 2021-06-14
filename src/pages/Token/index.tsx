import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { BaseContainer, PageContainer } from 'components';
import { Box } from 'grommet';
import { useQuery } from '@apollo/client';
import { ASSET_STATS } from 'analytics/queries';
import { formatUnits } from '@ethersproject/units';
import { TotalLockedDailyChart, VolumeDailyChart } from 'components/Charts';
import { useStores } from 'stores';
import {
  getAsset,
  getDailyAssetTVL,
  getDailyAssetVolume,
} from 'analytics/utils';
import { RecentEvents } from './EventsTable';
import { Text, Title } from 'components/Base';
import { formatWithTwoDecimals, formatZeroDecimals } from 'utils';
import { StatsBox } from 'components/Stats';

export const Token = observer(function Token({ match }) {
  const { tokens } = useStores();

  useEffect(() => {
    tokens.init();
    tokens.fetch();
  }, []);

  const { data } = useQuery(ASSET_STATS, {
    variables: {
      id: match.params.token.toLowerCase(),
    },
  });

  let asset = !tokens.isPending && data ? getAsset(tokens, data.asset) : null;

  return (
    <BaseContainer>
      <PageContainer>
        {!asset && <div>Loading</div>}
        {asset && (
          <>
            <Box
              direction="row"
              justify="between"
              align="center"
              margin={{ top: 'medium', horizontal: 'small' }}
            >
              <Title>
                {asset.name} ({asset.symbol})
              </Title>
              <Text>{`Last update: ${Math.round(
                (Date.now() - tokens.lastUpdateTime) / 1000,
              )}sec ago`}</Text>
            </Box>
            <Box direction="row" margin="small" gap="medium">
              <StatsBox
                header="Total Transactions"
                title="Total TXs"
                stats={formatZeroDecimals(data.asset.eventsCount)}
              />
              <StatsBox
                header="Total Value Locked, USD"
                title="TVL"
                stats={`$${formatWithTwoDecimals(formatUnits(asset.tvl, 2))}`}
              />
              <StatsBox
                header="Total Locked"
                title="Total Locked"
                stats={`${formatZeroDecimals(
                  formatUnits(data.asset.totalLocked, asset.decimals),
                )} ${asset.symbol.toUpperCase()}`}
              />
            </Box>
            <Box direction="row" justify="between" gap="xsmall">
              <TotalLockedDailyChart
                data={getDailyAssetTVL(asset)}
                lastUpdateTime={tokens.lastUpdateTime}
              />
              <VolumeDailyChart
                data={getDailyAssetVolume(asset)}
                lastUpdateTime={tokens.lastUpdateTime}
              />
            </Box>
            <Box direction="row" margin={{ top: 'medium' }}>
              <RecentEvents asset={asset} />
            </Box>
          </>
        )}
      </PageContainer>
    </BaseContainer>
  );
});
