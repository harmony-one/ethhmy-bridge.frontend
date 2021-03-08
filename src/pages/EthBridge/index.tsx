import * as React from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import * as styles from './styles.styl';
import { Exchange } from '../Exchange';
import { EXCHANGE_MODE, TOKEN } from 'stores/interfaces';
import cn from 'classnames';
import { Text } from 'components/Base';
import { WalletBalances } from './WalletBalances';
import { useEffect } from 'react';
import { BridgeHealth } from '../../components/Secret/BridgeHealthIndicator';

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
      className={cn(styles.largeButtonContainer, props.isActive ? styles.active : '')}
      onClick={props.onClick}
      gap="10px"
    >
      <BridgeHealth from_scrt={props.reverse} />
      <Box direction={props.reverse ? 'row-reverse' : 'row'} align="center">
        <Box direction="row" align="center">
          <img className={styles.imgToken} src="/static/eth.svg" />
          <Text size="large" className={styles.title}>
            ETH
          </Text>
        </Box>
        <Box direction="row" margin={{ horizontal: 'medium' }} align="center">
          <img src="/static/right.svg" />
        </Box>
        <Box direction="row" align="center">
          <img className={styles.imgToken} src="/static/scrt.svg" />
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

export const EthBridge = observer((props: any) => {
  const { exchange, routing, rewards, signerHealth } = useStores();

  useEffect(() => {
    rewards.init({
      isLocal: true,
      sorter: 'none',
      pollingInterval: 20000,
    });
    rewards.fetch();

    signerHealth.init({});
    signerHealth.fetch();

    if (props.match.params.token) {
      if ([TOKEN.ETH, TOKEN.ERC20].includes(props.match.params.token)) {
        exchange.setToken(props.match.params.token);
      } else {
        routing.push(TOKEN.ETH);
      }
    }

    if (props.match.params.operationId) {
      exchange.setOperationId(props.match.params.operationId);
      exchange.sendOperation(props.match.params.operationId);
    }
  }, []);

  return (
    <BaseContainer>
      <PageContainer>
        <Box direction="row" wrap={true} fill={true} justify="between" align="start">
          <Box direction="column" align="center" justify="center" className={styles.base}>
            {/*<Box*/}
            {/*  direction="row"*/}
            {/*  justify="center"*/}
            {/*  margin={{ top: 'large' }}*/}
            {/*>*/}
            {/*  <Title size="medium" color="BlackTxt" bold>*/}
            {/*    BUSD Bridge*/}
            {/*  </Title>*/}
            {/*</Box>*/}

            <Box
              direction="row"
              justify="between"
              className={styles.swapDirectionChoice}
              margin={{ vertical: 'large' }}
            >
              <LargeButton
                title="ETH -> Secret Network"
                description="(Metamask)"
                onClick={() => exchange.setMode(EXCHANGE_MODE.ETH_TO_SCRT)}
                isActive={exchange.mode === EXCHANGE_MODE.ETH_TO_SCRT}
              />
              <LargeButton
                title="Secret Network -> ETH"
                reverse={true}
                description="(Keplr)"
                onClick={() => exchange.setMode(EXCHANGE_MODE.SCRT_TO_ETH)}
                isActive={exchange.mode === EXCHANGE_MODE.SCRT_TO_ETH}
              />
            </Box>

            {/*<Box*/}
            {/*  margin={{ bottom: 'medium' }}*/}
            {/*>*/}
            {/*  <ERC20Select />*/}
            {/*</Box>*/}

            <Exchange />

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
