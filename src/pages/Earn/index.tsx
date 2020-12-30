import * as React from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import * as styles from '../EthBridge/styles.styl';

import cn from 'classnames';
import { Text } from 'components/Base';
// import { IColumn, Table } from '../../components/Table';
// import { ERC20Select } from '../Exchange/ERC20Select';
import EarnRow from '../../components/Earn/EarnRow';
import { rewardsDepositKey, rewardsKey, rewardsTokens } from '../../stores/UserStore';

// const styleLink = document.createElement("link");
// styleLink.rel = "stylesheet";
// styleLink.href =
//   "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
// document.head.appendChild(styleLink);


const EarnRewards = observer((props: any) => {
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
            {
              tokens.allData.map( (token) => {
                const rewards = rewardsTokens.find(element => element.symbol === token.symbol);
                if (!rewards) {
                  return (<></>);
                }
                const rewardstoken = {
                  rewardsContract: rewards.rewardsContract,
                  lockedAsset: rewards.lockedAsset,
                  totalLockedRewards: rewards.totalLocked,
                  rewards: user.balanceRewards[rewardsKey(token.symbol)],
                  deposit: user.balanceRewards[rewardsDepositKey(token.symbol)],
                  balance: user.balanceToken[token.symbol] ? user.balanceToken[token.symbol] : "unlock",
                  decimals: token.decimals,
                  name: token.name,
                  display_props: token.display_props,
                  remainingLockedRewards: "10000000",
                  deadline: 1610024346,
                }

                return (<EarnRow
                  secretjs={user.secretjs}
                  token={rewardstoken}
                />);
            })}

          </Box>
        </Box>

      </PageContainer>
    </BaseContainer>
  );
});

export default EarnRewards;