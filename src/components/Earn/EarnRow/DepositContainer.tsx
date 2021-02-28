import cn from 'classnames';
import * as styles from './styles.styl';
import { Button, Input } from 'semantic-ui-react';
import React from 'react';
import { unlockToken } from '../../../utils';
import ScrtTokenBalanceSingleLine from './ScrtTokenBalanceSingleLine';
import BigNumber from 'bignumber.js';

const buttonStyle = {
  borderRadius: '15px',
  fontSize: '1rem',
  fontWeight: 500,
  height: '30px',
  marginRight: '12px',
  marginLeft: '12px',
  padding: '0.5rem 1rem 1rem 1rem',
  color: '#2F80ED',
  backgroundColor: 'transparent',
};

const AmountButton = (props: { balance: string; multiplier: string; onChange: CallableFunction }) => {
  return (
    <Button.Group className={cn(styles.amountButton)}>
      <Button
        style={buttonStyle}
        disabled={!props.balance || props.balance === unlockToken}
        onClick={() => {
          changeInput(props.balance, props.multiplier, props.onChange);
        }}
      >
        {`${Number(props.multiplier) * 100}%`}
      </Button>
    </Button.Group>
  );
};

const changeInput = (balance, percentage, onChange) => {
  const event = {
    target: {
      value: new BigNumber(balance.replace(/,/g, ''))
        .multipliedBy(percentage)
        .toFixed(6 /* Earn can only work with down to 6 decimal points */, BigNumber.ROUND_DOWN),
    },
  };
  onChange(event);
};

const DepositContainer = props => {
  return (
    <div className={cn(styles.changeBalance)}>
      <div>
        <div className={cn(styles.balanceRow)}>
          <div className={cn(styles.h4)}>
            <ScrtTokenBalanceSingleLine
              value={props.balance}
              currency={props.currency}
              selected={false}
              balanceText={props.balanceText}
              popupText={props.unlockPopupText}
            />
          </div>
          <div className={cn(styles.subtitle)}>{props.balanceText}</div>
        </div>
        <div>
          <Input placeholder="0.0" className={cn(styles.form)} value={props.value} onChange={props.onChange}>
            <input style={{ borderRadius: '100px', height: '47px' }} />
          </Input>
        </div>
        <div className={styles.amountRow}>
          <AmountButton balance={props.balance} onChange={props.onChange} multiplier={'0.25'} />
          <AmountButton balance={props.balance} onChange={props.onChange} multiplier={'0.5'} />
          <AmountButton balance={props.balance} onChange={props.onChange} multiplier={'0.75'} />
          <AmountButton balance={props.balance} onChange={props.onChange} multiplier={'1'} />
        </div>
        <div>{props.action}</div>
      </div>
    </div>
  );
};

export default DepositContainer;
