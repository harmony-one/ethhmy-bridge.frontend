import cn from 'classnames';
import * as styles from './styles.styl';
import { Button, Input } from 'semantic-ui-react';
import React from 'react';
import { unlockToken } from '../../../utils';

const buttonStyle = {
  borderRadius: '15px',
  fontSize: '1rem',
  fontWeight: 500,
  height: '30px',
  marginRight: '12px',
  marginLeft: '12px',
  padding: '0.5rem 1rem 1rem 1rem',
  color: "#2F80ED",
  backgroundColor: "rgba(28,144,254,0.1)",
};

const AmountButton = (props: {balance: string, multiplier: string, onChange: CallableFunction}) => {
  return (<Button
    style={buttonStyle}
    disabled={!props.balance || props.balance === unlockToken}
    onClick={() => {
      changeInput(props.balance, props.multiplier, props.onChange)
    }}
  >
    {`${Number(props.multiplier) * 100}%`}
  </Button>);
}

const changeInput = (balance, percentage, onChange) => {
  const event = {
    target: {
      value: String(parseFloat(percentage) * parseFloat(balance))
    }
  }
  onChange(event)
}

const DepositContainer = props => {

  return (
    <div className={cn(styles.changeBalance)}>
      <div>
        <div className={cn(styles.balanceRow)}>
          <h3 className={cn(styles.h3)}> </h3>

          <h4 className={cn(styles.h4)}>{props.balance} {props.currency}</h4>
        </div>
        <div>
          <Input
            placeholder='0.0'
            className={cn(styles.form)}
            value={props.value}
            onChange={props.onChange}
          >
            <input style={{borderRadius: '100px', height: '47px'}} />
          </Input>
        </div>
        <div className={styles.amountRow}>
          <AmountButton
            balance={props.balance}
            onChange={props.onChange}
            multiplier={'0.25'}
          />
          <AmountButton
            balance={props.balance}
            onChange={props.onChange}
            multiplier={'0.5'}
          />
          <AmountButton
            balance={props.balance}
            onChange={props.onChange}
            multiplier={'0.75'}
          />
          <AmountButton
            balance={props.balance}
            onChange={props.onChange}
            multiplier={'1'}
          />
        </div>
        {props.action}
      </div>
    </div>
  )
}

export default DepositContainer;
