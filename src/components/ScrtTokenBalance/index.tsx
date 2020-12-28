import React from 'react';
import Loader from 'react-loader-spinner';
import SoftTitleValue from '../SoftTitleValue';

const ScrtTokenBalance = props => {
  return (<SoftTitleValue
    title={props.value ? props.value : <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" />}
    subTitle={"Available Balance"}
    />
  )
};

export default ScrtTokenBalance;
