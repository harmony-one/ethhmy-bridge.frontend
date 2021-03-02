import * as React from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import * as styles from './styles.styl';
import { Exchange } from '../Exchange';
import { TOKEN } from 'stores/interfaces';
import { Title } from 'components/Base';
import { WalletBalances } from './WalletBalances';
import { useEffect } from 'react';


export const EthBridge = observer((props: any) => {
  const { exchange, routing, rewards } = useStores();

  useEffect(() => {
    rewards.init({
      isLocal: true,
      sorter: 'none',
      pollingInterval: 20000,
    });
    rewards.fetch();

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
        <Box direction="row" wrap={true} fill justify="between" align="start">
          <Box fill direction="column" align="center" justify="center" className={styles.base}>
            <Box fill direction="row" justify="between" align="end" margin={{ bottom: 'medium', top: 'large' }}>
              <Title bold >Secret Bridge</Title>
              <WalletBalances />
            </Box>
            <Exchange />
          </Box>
        </Box>
      </PageContainer>
    </BaseContainer>
  );
});
