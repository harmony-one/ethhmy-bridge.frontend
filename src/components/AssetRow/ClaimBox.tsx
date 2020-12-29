import cn from 'classnames';
import * as styles from './styles.styl';
import SoftTitleValue from '../SoftTitleValue';
import ClaimButton from './ClaimButton';
import React from 'react';

const ClaimBox = props => {
  return (
    <div className={cn(styles.claimBox)}>
      <div>
        <div className={cn(styles.items)}>
          <SoftTitleValue title={`${props.available} sSCRT`} subTitle={"Available Rewards"} />
        </div>
        {ClaimButton(props)}
      </div>
    </div>
  );
}

export default ClaimBox;
