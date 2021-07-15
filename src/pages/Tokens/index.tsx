import React, { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { NETWORK_TYPE } from 'stores/interfaces';
import { formatWithTwoDecimals, formatZeroDecimals } from 'utils';
import { Text, Title } from 'components/Base';
import { SearchInput } from 'components/Search';
import { getBech32Address } from '../../blockchain-bridge';
import { NetworkButton } from './Components';
import { TokensTable } from './TokensTable';
import { useQuery } from '@apollo/client';
import { STATS_QUERY } from 'analytics/queries';
import { TotalLockedDailyChart, VolumeDailyChart } from 'components/Charts';
import { StatsBox } from 'components/Stats';
import { formatEther } from '@ethersproject/units';

async function fetchAssets() {
  const res = await fetch(`${process.env.ASSETS_INFO_SERVICE}/assets`);
  return await res.json();
}

async function fetchTvl() {
  const res = await fetch(`${process.env.ASSETS_INFO_SERVICE}/charts/tvl`);
  return await res.json();
}

async function fetchVolume() {
  const res = await fetch(`${process.env.ASSETS_INFO_SERVICE}/charts/volume`);
  return await res.json();
}

export const Tokens = observer((props: any) => {
  const { routing, assets } = useStores();
  const [search, setSearch] = useState('');
  const [network, setNetwork] = useState<NETWORK_TYPE | 'ALL'>('ALL');

  const { data: statsData } = useQuery(STATS_QUERY);

  const [tvl, setTvl] = useState(0);
  const [tvlChart, setTvlChart] = useState([]);

  useEffect(() => {
    assets.init();
    fetchAssets().then(res => {
      assets.set(res.assets);
      setTvl(parseInt(formatEther(res.tvl)));
    });
  }, []);

  useEffect(() => {
    fetchTvl().then(tvl => setTvlChart(tvl));
  }, []);

  const [volumeChart, setVolumeChart] = useState([]);

  useEffect(() => {
    fetchVolume().then(volume => setVolumeChart(volume));
  }, []);

  let data = assets.isPending ? [] : assets.data;

  useEffect(() => {
    assets.selectedNetwork = network === 'ALL' ? undefined : network;
  }, [network]);

  const onChangeDataFlow = (props: any) => {
    assets.onChangeDataFlow(props);
  };

  const lastUpdateAgo = Math.ceil((Date.now() - assets.lastUpdateTime) / 1000);

  const filteredData = data.filter(token => {
    let iSearchOk = true;
    let isNetworkOk = true;

    if (search) {
      iSearchOk = [
        token.id,
        token.name,
        token.symbol,
        token.mappedAddress,
        getBech32Address(token.id).toLowerCase(),
      ].some(
        value =>
          value &&
          value
            .toString()
            .toLowerCase()
            .includes(search.toLowerCase()),
      );
    }

    if (network !== 'ALL') {
      isNetworkOk = token.network === network;
    }

    return iSearchOk && isNetworkOk;
  });

  return (
    <BaseContainer>
      <PageContainer>
        <Box
          direction="row"
          justify="between"
          align="center"
          margin={{ top: 'medium', horizontal: 'small' }}
        >
          <Title>Bridged Assets</Title>
          {/* <Text>{`Last update: ${lastUpdateAgo}sec ago`}</Text> */}
        </Box>
        <Box direction="row" margin="small" gap="medium">
          <StatsBox
            header="Total Transactions"
            title="Total TXs"
            stats={formatZeroDecimals(statsData?.stats.eventsCount ?? 0)}
          />
          <StatsBox
            header="Total Value Locked, USD"
            title="TVL"
            stats={`$${formatWithTwoDecimals(tvl)}`}
          />
          <StatsBox
            header="Unique Users"
            title="Users"
            stats={formatZeroDecimals(statsData?.stats.usersCount ?? 0)}
          />
        </Box>
        <Box direction="row" justify="between" gap="xsmall">
          <TotalLockedDailyChart data={tvlChart} />
          <VolumeDailyChart data={volumeChart} />
        </Box>
        <Box
          pad={{ horizontal: 'small' }}
          margin={{ top: 'medium', bottom: 'medium' }}
          direction="row"
          justify="between"
        >
          <SearchInput value={search} onChange={setSearch} />
          <Box direction="row" gap="10px">
            <NetworkButton
              type={'ALL'}
              selectedType={network}
              onClick={() => setNetwork('ALL')}
            />
            <NetworkButton
              type={NETWORK_TYPE.BINANCE}
              selectedType={network}
              onClick={() => setNetwork(NETWORK_TYPE.BINANCE)}
            />
            <NetworkButton
              type={NETWORK_TYPE.ETHEREUM}
              selectedType={network}
              onClick={() => setNetwork(NETWORK_TYPE.ETHEREUM)}
            />
          </Box>
        </Box>

        <Box
          direction="row"
          wrap={true}
          fill={true}
          justify="center"
          align="start"
          pad="small"
        >
          <TokensTable
            assets={filteredData}
            isPending={assets.isPending && assets}
            dataFlow={assets.dataFlow}
            onChangeDataFlow={onChangeDataFlow}
            onRowClicked={row => {
              routing.push(`/tokens/${row.id}`);
            }}
          />
        </Box>
      </PageContainer>
    </BaseContainer>
  );
});
