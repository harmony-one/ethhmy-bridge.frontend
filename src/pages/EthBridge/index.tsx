import * as React from 'react';
import { useEffect } from 'react';
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
          <img className={styles.imgToken} src="/one.svg" />
          <Text size="large" className={styles.title}>
            ONE
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
  const { user, exchange, routing, userMetamask, tokens } = useStores();

  useEffect(() => {
    tokens.init();
    tokens.fetch();
  }, []);

  useEffect(() => {
    if (props.match.params.token) {
      if (
        [
          TOKEN.LINK,
          TOKEN.BUSD,
          TOKEN.ERC20,
          TOKEN.ETH,
          TOKEN.ERC721,
          TOKEN.HRC20,
          TOKEN.ONE,
        ].includes(props.match.params.token)
      ) {
        exchange.setToken(props.match.params.token);

        if (TOKEN.ETH === props.match.params.token) {
          user.setHRC20Token(process.env.ETH_HRC20);
          userMetamask.setTokenDetails({
            name: 'ETH',
            decimals: '18',
            erc20Address: '',
            symbol: 'ETH',
          });
        }
      } else {
        routing.push(TOKEN.BUSD);
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
              width="560px"
              margin={{ vertical: 'large' }}
            >
              <LargeButton
                title="ETH -> ONE"
                description="(Metamask)"
                onClick={() => exchange.setMode(EXCHANGE_MODE.ETH_TO_ONE)}
                isActive={exchange.mode === EXCHANGE_MODE.ETH_TO_ONE}
              />
              <LargeButton
                title="ONE -> ETH"
                reverse={true}
                description={user.isMetamask ? '(Metamask)' : '(ONE Wallet)'}
                onClick={() => exchange.setMode(EXCHANGE_MODE.ONE_TO_ETH)}
                isActive={exchange.mode === EXCHANGE_MODE.ONE_TO_ETH}
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
          <WalletBalances />
        </Box>
      </PageContainer>
    </BaseContainer>
  );
});
