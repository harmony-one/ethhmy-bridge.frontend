import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { BaseContainer, PageContainer } from 'components';
import { Box } from 'grommet';
import { useQuery } from '@apollo/client';
import { ASSET_STATS } from 'analytics/queries';
import { formatEther, formatUnits } from '@ethersproject/units';
import { TotalLockedDailyChart, VolumeDailyChart } from 'components/Charts';
import { useStores } from 'stores';
import { getAsset } from 'analytics/utils';
import { RecentEvents } from './EventsTable';
import { Text, Title } from 'components/Base';
import { formatWithTwoDecimals, formatZeroDecimals } from 'utils';
import { StatsBox } from 'components/Stats';

async function fetchAsset(id) {
  const res = await fetch(`${process.env.ASSETS_INFO_SERVICE}/assets/${id}`);
  return await res.json();
}

async function fetchTvl(id) {
  const res = await fetch(
    `${process.env.ASSETS_INFO_SERVICE}/charts/${id}/tvl`,
  );
  return await res.json();
}

async function fetchVolume(id) {
  const res = await fetch(
    `${process.env.ASSETS_INFO_SERVICE}/charts/${id}/volume`,
  );
  return await res.json();
}

export const Token = observer(function Token({ match }) {
  const [asset, setAsset] = useState(null);

  useEffect(() => {
    fetchAsset(match.params.token.toLowerCase()).then(res => {
      setAsset(res.asset);
    });
  }, [match.params.token]);

  const { data } = useQuery(ASSET_STATS, {
    variables: {
      id: match.params.token.toLowerCase(),
    },
  });

  const [tvlChart, setTvlChart] = useState([]);
  const [volumeChart, setVolumeChart] = useState([]);

  useEffect(() => {
    fetchTvl(match.params.token.toLowerCase()).then(tvl => setTvlChart(tvl));
  }, [match.params.token]);

  useEffect(() => {
    fetchVolume(match.params.token.toLowerCase()).then(volume =>
      setVolumeChart(volume),
    );
  }, [match.params.token]);

  console.log(asset);

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
                stats={`$${formatWithTwoDecimals(formatEther(asset.tvl))}`}
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
              <TotalLockedDailyChart data={tvlChart} />
              <VolumeDailyChart data={volumeChart} />
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
