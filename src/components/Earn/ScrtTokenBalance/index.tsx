import React from 'react';
import Loader from 'react-loader-spinner';
import SoftTitleValue from '../SoftTitleValue';
import UnlockToken from '../EarnRow/UnlockToken';
import { UserStoreEx } from '../../../stores/UserStore';
import { balanceNumberFormat, divDecimals, priceNumberFormat, unlockToken } from '../../../utils';


const ScrtTokenBalance = (props: {value: string, decimals: string | number, currency: string, subtitle?: string,
  userStore: UserStoreEx, tokenAddress: string, selected: boolean}) => {

  // <div>
  //     <h3 className={cn(styles.scrtAssetBalance)}>{props.title}</h3>
  //     <h5 className={cn(styles.subMenu)}>{props.subTitle}</h5>
  //   </div>
  const text = props.subtitle ? props.subtitle : "Available Balance"

  if (!props.value) {
    return (<SoftTitleValue
        title={<Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" />}
        subTitle={text}
      />
    );
  } else if (props.value === unlockToken) {
    return (
      <div style={{margin: 0, display: "flex", flex: 1}}>
        <UnlockToken
          userStore={props.userStore}
          tokenAddress={props.tokenAddress}
          selected={props.selected}
        />
        <SoftTitleValue
          title={"Unlock Token"}
          subTitle={"Rewards unavailable"}
        />
      </div>
      );
  } else {
    return (<SoftTitleValue
      title={`${balanceNumberFormat.format(Number(divDecimals(props.value.replace(/,/g, ''), props.decimals)))} ${props.currency}`}
      subTitle={text}
    />);
  }


};

export default ScrtTokenBalance;
