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
import { formatWithTwoDecimals } from 'utils';

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
              margin={{ top: 'medium' }}
              pad={{ horizontal: 'medium' }}
            >
              <Title>
                {asset.name} ({asset.symbol})
              </Title>

              <Box direction="column">
                <Title size="small">
                  Total Value Locked (USD){' '}
                  <span
                    style={{
                      marginLeft: 5,
                      color: '#47b8eb',
                      fontWeight: 600,
                      letterSpacing: 0.2,
                    }}
                  >
                    ${formatWithTwoDecimals(formatUnits(asset.tvl, 2))}
                  </span>
                </Title>
              </Box>

              <Text>{`Last update: ${Math.round(
                (Date.now() - tokens.lastUpdateTime) / 1000,
              )}sec ago`}</Text>
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
            <Box
              direction="row"
              justify="between"
              align="center"
              margin={{ top: 'medium' }}
            >
              <RecentEvents asset={asset} />
            </Box>
          </>
        )}
      </PageContainer>
    </BaseContainer>
  );
});
