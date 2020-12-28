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
// import { IColumn, Table } from '../../components/Table';
import { ITokenInfo } from '../../stores/interfaces';
import { getScrtAddress } from '../../blockchain-bridge/scrt';
import { formatWithTwoDecimals } from '../../utils';
// import { ERC20Select } from '../Exchange/ERC20Select';
import { Header, Image, Table, Button } from 'semantic-ui-react'
import ScrtTokenBalance from '../../components/ScrtTokenBalance';
import AssetRow from '../../components/AssetRow';

const styleLink = document.createElement("link");
styleLink.rel = "stylesheet";
styleLink.href =
  "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
document.head.appendChild(styleLink);

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
  const { user, exchange, routing, tokens } = useStores();

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
          <AssetRow />
            <Table celled>
              <Table.Body>
                {tokens.allData.map(value => {
                  return (<Table.Row>
                    <Table.Cell>
                      <Image src={value.display_props.image} rounded size='mini' />
                    </Table.Cell>
                      <Table.Cell>
                        <Header as='h4'>
                          {value.name}
                          <Header.Content>
                            <Header.Subheader>{value.display_props.symbol}</Header.Subheader>
                          </Header.Content>
                        </Header>
                    </Table.Cell>
                    <Table.Cell>{100000000}</Table.Cell>
                    <Table.Cell>{100000000}</Table.Cell>
                    <Table.Cell>
                      <ScrtTokenBalance value={user.balanceRewards["sscrt"]}/>
                      </Table.Cell>
                    <Table.Cell><ScrtTokenBalance value={user.balanceRewards["sscrt"]}/></Table.Cell>
                    <Table.Cell><Button primary>Earn</Button></Table.Cell>
                    <Table.Cell><Button primary>Withdraw</Button></Table.Cell>
                    </Table.Row>
                  );
                })
                }
              </Table.Body>
            </Table>

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
