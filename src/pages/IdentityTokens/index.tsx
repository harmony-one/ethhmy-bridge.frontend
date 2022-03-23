import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { IColumn, Table } from 'components/Table';
import {
  IIdentityTokenInfo,
  NETWORK_TYPE,
} from 'stores/interfaces';
import { truncateAddressString } from 'utils';
import * as styles from './styles.styl';
import { Text, Title } from 'components/Base';
import { SearchInput } from 'components/Search';
import { getBech32Address, getChecksumAddress } from '../../blockchain-bridge';
import { NETWORK_ICON } from '../../stores/names';
import { useMediaQuery } from 'react-responsive';

const EthAddress = observer(
  ({ value, network }: { value: string; network: NETWORK_TYPE }) => {
    const { exchange } = useStores();

    return (
      <Box
        direction="row"
        justify="start"
        align="center"
        style={{ marginTop: 4 }}
      >
        <img
          className={styles.imgToken}
          style={{ height: 20 }}
          src={NETWORK_ICON[network]}
        />
        <a
          className={styles.addressLink}
          href={`${exchange.getExplorerByNetwork(network)}/token/${value}`}
          target="_blank"
        >
          {truncateAddressString(value, 15)}
        </a>
      </Box>
    );
  },
);

const oneAddress = value => (
  <Box direction="row" justify="start" align="center" style={{ marginTop: 4 }}>
    <img className={styles.imgToken} style={{ height: 18 }} src="/one.svg" />
    <a
      className={styles.addressLink}
      href={`${process.env.HMY_EXPLORER_URL}/address/${value}?activeTab=3`}
      target="_blank"
    >
      {truncateAddressString(value, 15)}
    </a>
  </Box>
);

const getAssetAddress = (data, type) => {
  switch (type) {
    case "origin":
      return <EthAddress value={data.contractAddress} network={NETWORK_TYPE.ETHEREUM} />
    default :
      const address =
        String(data.mappingAddress).toLowerCase() ===
        String(process.env.ONE_HRC20).toLowerCase()
          ? String(data.mappingAddress).toLowerCase()
          : getChecksumAddress(data.mappingAddress);

      return oneAddress(address);
  }
}

const getColumns = ({ hmyLINKBalanceManager }): IColumn<IIdentityTokenInfo>[] => [
  {
    title: '',
    key: 'avatar',
    dataIndex: 'avatar',
    className: styles.leftHeader,
    width: 50,
    render: (value, data) => (
      <Box direction="row" justify="center" pad={{ left: 'medium' }}>
        <a href={data.website} target="_blank">
          <img src={value} className={styles.itokenAvatar}/>
        </a>
      </Box>
    )
  },
  {
    title: 'Name',
    key: 'name',
    dataIndex: 'name',
    width: 320,
    render: (value, data) => (
      <Box direction="row" justify="start">
        <strong>{value}</strong>
        <a href={data.twitter} target="_blank">
          <img src="/twitter.svg" className={styles.itokenTwitter}/>
        </a>
      </Box>
    )
  },
  {
    title: 'Origin Address',
    key: 'contractAddress',
    dataIndex: 'contractAddress',
    width: 350,
    render: (value, data) => (
      getAssetAddress(data, "origin")
    ),
  },
  {
    title: 'Mapping Address',
    key: 'mappingAddress',
    dataIndex: 'mappingAddress',
    width: 350,
    render: (value, data) => (
      getAssetAddress(data, "mapping")
    ),
  },
  {
    title: 'Get It',
    key: 'openSea',
    dataIndex: 'openSea',
    width: 150,
    render: (value, data) => (
      <Box direction="row" justify="start">
        <a href={value} target="_blank"><img src="/opensea.svg" width="30px"/></a>
      </Box>
    ),
  }
];

export const IdentityTokens = observer((props: any) => {
  const { itokens, user } = useStores();
  const [search, setSearch] = useState('');
  const [columns, setColumns] = useState(getColumns(user));
  const isMobile = useMediaQuery({ query: '(max-width: 600px)' });

  useEffect(() => {
    itokens.init();
    itokens.fetch();
  }, []);

  useEffect(() => {
    setColumns(getColumns(user));
  }, [user.hmyLINKBalanceManager]);

  const onChangeDataFlow = (props: any) => {
    itokens.onChangeDataFlow(props);
  };

  const lastUpdateAgo = Math.ceil((Date.now() - itokens.lastUpdateTime) / 1000);

  const filteredData = itokens.allData.filter(itoken => {
    let iSearchOk = true;

    if (search) {
      iSearchOk =
        Object.values(itoken).some(
          value =>
            value &&
            value
              .toString()
              .toLowerCase()
              .includes(search.toLowerCase()),
        ) ||
        getBech32Address(itoken.contractAddress).toLowerCase() ===
          search.toLowerCase();
    }

    return iSearchOk;
  });

  return (
    <BaseContainer>
      <PageContainer>
        <Box
          direction={isMobile ? 'column' : 'row'}
          justify="between"
          align={isMobile ? 'start' : 'center'}
          margin={{ top: isMobile ? 'large': 'medium' }}
          pad={{ horizontal: 'medium' }}
        >
          <Title>Identity Tokens</Title>

          <Text>{`Last update: ${lastUpdateAgo}sec ago`}</Text>
        </Box>

        {!isMobile ? (
          <Box
            pad={{ horizontal: '9px' }}
            margin={{ top: 'medium', bottom: 'medium' }}
            // style={{ maxWidth: 500 }}
            direction={isMobile ? 'column' : 'row'}
            justify="between"
            align={isMobile ? 'start' : 'end'}
            gap="40px"
          >
            <SearchInput value={search} onChange={setSearch} />
          </Box>
        ) : (
          <Box
            direction="row"
            gap="10px"
            align="start"
            margin={{ top: '20px', bottom: '10px' }}
          >
            <SearchInput value={search} onChange={setSearch} />
          </Box>
        )}

        <Box
          direction="row"
          wrap={true}
          fill={true}
          justify="center"
          align="start"
        >
          {isMobile ? (
            <Table
              data={filteredData}
              columns={columns}
              isPending={itokens.isPending}
              hidePagination={true}
              dataLayerConfig={itokens.dataFlow}
              onChangeDataFlow={onChangeDataFlow}
              onRowClicked={() => {}}
              customItem={{
                bodyStyle: {},
                dir: 'column',
                render: props => {
                  const data = props.params as IIdentityTokenInfo;

                  return (
                    <Box
                      style={{
                        width: 'calc(100vw - 20px)',
                        overflow: 'hidden',
                        borderRadius: '5px',
                        background: 'white',
                      }}
                      direction="column"
                      pad="medium"
                      margin={{ top: '15px' }}
                      gap="5px"
                    >
                      <Text bold={true}>
                        {data.name}
                      </Text>
                      <Text>
                        Origin Address:{' '}
                        <EthAddress
                          value={data.contractAddress}
                          network={NETWORK_TYPE.ETHEREUM}
                        />
                      </Text>
                      <Text>Mapping Address: {oneAddress(data.mappingAddress)}</Text>
                    </Box>
                  ) as any;
                },
              }}
            />
          ) : (
            <Table
              data={filteredData}
              columns={columns}
              isPending={itokens.isPending}
              hidePagination={true}
              dataLayerConfig={itokens.dataFlow}
              onChangeDataFlow={onChangeDataFlow}
              onRowClicked={() => {}}
            />
          )}
        </Box>
      </PageContainer>
    </BaseContainer>
  );
});
