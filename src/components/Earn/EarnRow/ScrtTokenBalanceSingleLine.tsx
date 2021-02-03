import { balanceNumberFormat, toFixedTrunc, unlockToken } from '../../../utils';
import React from 'react';
import Loader from 'react-loader-spinner';
import { Icon, Popup } from 'semantic-ui-react';

const ScrtTokenBalanceSingleLine = (props: {
  value: string;
  currency: string;
  selected: boolean;
  balanceText: string;
  popupText: string;
}) => {
  if (!props.value) {
    return <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" />;
  } else if (props.value === unlockToken) {
    return (
      <div>
        <Popup
          content={props.popupText}
          trigger={
            <div>
              <Icon name="question circle outline" />
              {props.currency}
            </div>
          }
        />
      </div>
    );
  } else {
    return (
      <>
        {balanceNumberFormat.format(
          toFixedTrunc(Number(props.value.replace(/,/g, '')), 6),
        )}{' '}
        {props.currency}
      </>
    );
  }
};

export default ScrtTokenBalanceSingleLine;
