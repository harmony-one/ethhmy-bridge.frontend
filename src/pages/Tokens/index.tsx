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
import { DAILY_TOKENS_STATS, STATS_QUERY } from 'analytics/queries';
import { BigNumber } from '@ethersproject/bignumber';
import { TotalLockedDailyChart, VolumeDailyChart } from 'components/Charts';
import {
  getAssets,
  getDailyAssetsTVL,
  getDailyAssetsVolume,
} from 'analytics/utils';
import { StatsBox } from 'components/Stats';

export const Tokens = observer((props: any) => {
  const { tokens, routing } = useStores();
  const [search, setSearch] = useState('');
  const [network, setNetwork] = useState<NETWORK_TYPE | 'ALL'>('ALL');
  const { data, startPolling, stopPolling } = useQuery(DAILY_TOKENS_STATS);

  const { data: dataStats } = useQuery(STATS_QUERY);

  useEffect(() => {
    tokens.init();
    tokens.fetch();
  }, []);

  useEffect(() => {
    startPolling(30000);
    return () => {
      stopPolling();
    };
  }, []);

  let assets = !tokens.isPending && data ? getAssets(tokens, data) : [];

  if (tokens.sorter && tokens.sorter !== 'none') {
    const sorter = Array.isArray(tokens.sorter)
      ? tokens.sorter[0]
      : tokens.sorter;

    const [index, direction] = sorter.split(',');
    const dir = direction === 'asc' ? 1 : -1;
    assets = assets.slice().sort((a, b) => {
      if (BigNumber.isBigNumber(a[index])) {
        return BigNumber.from(a[index]).lt(b[index]) ? dir : -dir;
      }

      return Number(a[index]) < Number(b[index]) ? dir : -dir;
    });
  }

  // useEffect(() => {
  //   tokens.selectedNetwork = network === 'ALL' ? undefined : network;
  // }, [network]);

  const onChangeDataFlow = (props: any) => {
    tokens.onChangeDataFlow(props);
  };

  const lastUpdateAgo = Math.ceil((Date.now() - tokens.lastUpdateTime) / 1000);

  const volumeData = getDailyAssetsVolume(assets);
  const tvlData = getDailyAssetsTVL(assets);

  const tvl =
    data && tvlData.length > 0 ? tvlData.reverse()[0][1].toString() : 0;

  const filteredData = assets.filter(token => {
    // if (!Number(token.totalSupply)) {
    //   return false;
    // }

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
          <Text>{`Last update: ${lastUpdateAgo}sec ago`}</Text>
        </Box>
        <Box direction="row" margin="small" gap="medium">
          <StatsBox
            header="Total Transactions"
            title="Total TXs"
            stats={formatZeroDecimals(dataStats?.stats.eventsCount ?? 0)}
          />
          <StatsBox
            header="Total Value Locked, USD"
            title="TVL"
            stats={`$${formatWithTwoDecimals(tvl)}`}
          />
          <StatsBox
            header="Unique Users"
            title="Users"
            stats={formatZeroDecimals(dataStats?.stats.usersCount ?? 0)}
          />
        </Box>
        <Box direction="row" justify="between" gap="xsmall">
          <TotalLockedDailyChart
            lastUpdateTime={tokens.lastUpdateTime}
            data={tvlData}
          />
          <VolumeDailyChart
            lastUpdateTime={tokens.lastUpdateTime}
            data={volumeData}
          />
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
            isPending={tokens.isPending && assets}
            dataFlow={tokens.dataFlow}
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
