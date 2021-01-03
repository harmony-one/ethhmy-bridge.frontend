import cn from 'classnames';
import * as styles from './styles.styl';
import SoftTitleValue from '../SoftTitleValue';
import ClaimButton from './ClaimButton';
import React from 'react';
import ScrtTokenBalance from '../ScrtTokenBalance';
import { UserStoreEx } from '../../../stores/UserStore';

const ClaimBox = (props: {rewardsContract: string, decimals?: string | number, userStore: UserStoreEx, available: string}) => {
  return (
    <div className={cn(styles.claimBox)}>
      <div>
        <div className={cn(styles.items)}>
          <ScrtTokenBalance
           subtitle={"Available Rewards"}
           tokenAddress={props.rewardsContract}
           decimals={props.decimals || 1}
           userStore={props.userStore}
           currency={"sSCRT"} selected={false} value={props.available}/>
          {/*<SoftTitleValue title={`${} sSCRT`} subTitle={} />*/}
        </div>
        {<ClaimButton
          secretjs={props.userStore.secretjs}
          contract={props.rewardsContract}
        />}
      </div>
    </div>
  );
}

export default ClaimBox;
