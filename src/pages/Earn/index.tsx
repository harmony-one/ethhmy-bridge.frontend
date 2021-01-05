import * as React from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import * as styles from '../EthBridge/styles.styl';
// import { IColumn, Table } from '../../components/Table';
// import { ERC20Select } from '../Exchange/ERC20Select';
import EarnRow from '../../components/Earn/EarnRow';
import { rewardsDepositKey, rewardsKey } from '../../stores/UserStore';
import { divDecimals, unlockToken } from '../../utils';
import { useEffect } from 'react';

// const styleLink = document.createElement("link");
// styleLink.rel = "stylesheet";
// styleLink.href =
//   "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
// document.head.appendChild(styleLink);


export const EarnRewards = observer((props: any) => {

  const { user, tokens, rewards } = useStores();

  useEffect(() => {
    rewards.init({
      isLocal: true,
      sorter: 'none',
      pollingInterval: 20000,
    });
    rewards.fetch();
  }, []);


  // Load tokens from DB
  //tokens.fetch();
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
             rewards.allData.map( (rewardToken) => {
               console.log(rewardToken.inc_token.address)
               const token = tokens.allData.find(element => element.dst_address === rewardToken.inc_token.address)
                 if (!token) {
                   return (<></>);
                 }
                 const rewardsToken = {
                   rewardsContract: rewardToken.pool_address,
                   lockedAsset: rewardToken.inc_token.symbol,
                   lockedAssetAddress: token.dst_address,
                   totalLockedRewards: divDecimals(Number(rewardToken.total_locked) * Number(token.price), rewardToken.inc_token.decimals) ,
                   rewardsDecimals: String(rewardToken.rewards_token.decimals),
                   rewards: user.balanceRewards[rewardsKey(rewardToken.inc_token.symbol)],
                   deposit: user.balanceRewards[rewardsDepositKey(rewardToken.inc_token.symbol)],
                   balance: user.balanceToken[token.src_coin] ? user.balanceToken[token.src_coin] : unlockToken,
                   decimals: token.decimals,
                   name: token.name,
                   display_props: token.display_props,
                   remainingLockedRewards: rewardToken.pending_rewards,
                   deadline: Number(rewardToken.deadline),
                 }

                 return (<EarnRow
                   userStore={user}
                   token={rewardsToken}
                 />);

              // tokens.allData.map( (token) => {
              //   const rewardInfo = rewards.allData.find(element =>
              //     element.pools.find(e => e.inc_token.address === token.dst_address));
              //   if (!rewardInfo) {
              //     return (<></>);
              //   }
              //   const rewardstoken = {
              //     rewardsContract: rewardInfo.pools[0].pool_address,
              //     lockedAsset: rewardInfo.pools[0].inc_token,
              //     lockedAssetAddress: token.dst_address,
              //     totalLockedRewards: rewardInfo.total_locked,
              //     rewardsDecimals: rewardInfo.pools[0].inc_token.decimals,
              //     rewards: user.balanceRewards[rewardsKey(token.display_props.symbol)],
              //     deposit: user.balanceRewards[rewardsDepositKey(token.display_props.symbol)],
              //     balance: user.balanceToken[token.src_coin] ? user.balanceToken[token.src_coin] : unlockToken,
              //     decimals: token.decimals,
              //     name: token.name,
              //     display_props: token.display_props,
              //     remainingLockedRewards: rewardInfo.pending_rewards,
              //     deadline: rewardInfo.deadline,
              //   }
              //
              //   return (<EarnRow
              //     userStore={user}
              //     token={rewardstoken}
              //   />);
            })}

          </Box>
        </Box>

      </PageContainer>
    </BaseContainer>
  );
});
