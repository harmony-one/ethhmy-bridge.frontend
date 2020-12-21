import * as React from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import * as styles from '../EthBridge/styles.styl';

import cn from 'classnames';
import { Text } from 'components/Base';
import { WalletBalances } from '../EthBridge/WalletBalances';
import { Rewards } from '../EthBridge/Rewards';
import { useEffect } from 'react';
import { IColumn, Table } from '../../components/Table';
import { ITokenInfo } from '../../stores/interfaces';
import { getScrtAddress } from '../../blockchain-bridge/scrt';
import { formatWithTwoDecimals } from '../../utils';
// import { ERC20Select } from '../Exchange/ERC20Select';

const LargeButton = (props: {
  title: string;
  onClick: () => void;
  description: string;
  isActive: boolean;
  reverse?: boolean;
}) => {
  return (
    <Box
      direction="column"
      align="center"
      justify="center"
      className={cn(
        styles.largeButtonContainer,
        props.isActive ? styles.active : '',
      )}
      onClick={props.onClick}
      gap="10px"
    >
      <Box direction={props.reverse ? 'row-reverse' : 'row'} align="center">
        <Box direction="row" align="center">
          <img className={styles.imgToken} src="/eth.svg" />
          <Text size="large" className={styles.title}>
            ETH
          </Text>
        </Box>
        <Box direction="row" margin={{ horizontal: 'medium' }} align="center">
          <img src="/right.svg" />
        </Box>
        <Box direction="row" align="center">
          <img className={styles.imgToken} src="/scrt.svg" />
          <Text size="large" className={styles.title}>
            Secret
          </Text>
        </Box>
      </Box>
      <Text size="xsmall" color="#748695" className={styles.description}>
        {props.description}
      </Text>
    </Box>
  );
};


export const EarnRewards = observer((props: any) => {
  const { user, exchange, routing } = useStores();

  // useEffect(() => {
  //   if (props.match.params.token) {
  //     if (
  //       [TOKEN.ETH, TOKEN.ERC20].includes(props.match.params.token)
  //     ) {
  //       exchange.setToken(props.match.params.token);
  //     } else {
  //       routing.push(TOKEN.ETH);
  //     }
  //   }
  //
  //
  // }, []);

  return (
    <BaseContainer>
      <PageContainer>
        <Box
          direction="row"
          wrap={true}
          fill={true}
          justify="between"
          align="start"
        >
          <Box
            direction="column"
            align="center"
            justify="center"
            className={styles.base}
          >

            <Table
              data={[]}
              columns={[]}
              isPending={false}
              hidePagination={true}
              dataLayerConfig={[]}
              onChangeDataFlow={() => {}}
              onRowClicked={() => {}}
            />

            <Rewards />


            {/*<Box*/}
            {/*  margin={{ bottom: 'medium' }}*/}
            {/*>*/}
            {/*  <ERC20Select />*/}
            {/*</Box>*/}
            {/*<Box*/}
            {/*  className={styles.walletBalancesContainer}*/}
            {/*>*/}
            {/*  <DisableWrap disabled={!user.isAuthorized}>*/}
            {/*    <WalletBalances />*/}
            {/*  </DisableWrap>*/}
            {/*</Box>*/}
          </Box>
          <Box>
            <WalletBalances />

          </Box>
        </Box>

      </PageContainer>
    </BaseContainer>
  );
});
