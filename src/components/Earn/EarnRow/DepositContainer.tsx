import cn from 'classnames';
import * as styles from './styles.styl';
import { Button, Input } from 'semantic-ui-react';
import React from 'react';

const buttonStyle = {
  borderRadius: '15px',
  fontSize: '1rem',
  fontWeight: 500,
  height: '30px',
  marginRight: '12px',
  marginLeft: '12px',
  padding: '0.5rem 1rem 1rem 1rem',
  transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  color: "#2F80ED",
  backgroundColor: "rgba(28,144,254,0.1)",
};

const DepositContainer = props => {

  const changeInput = percentage => {
    const event = {
      target: {
        value: String(parseFloat(percentage) * parseFloat(props.balance))
      }
    }
    props.onChange(event)
  }

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
          <Button
            style={buttonStyle}
            onClick={() => {
              changeInput('0.25')
            }}
          >
            25%
          </Button>
          <Button
            style={buttonStyle}
            onClick={() => {
              changeInput('0.50')
            }}
          >
            50%
          </Button>
          <Button
            style={buttonStyle}
            onClick={() => {
              changeInput('0.75')
            }}
          >
            75%
          </Button>
          <Button
            style={buttonStyle}
            onClick={() => {
              changeInput('1')
            }}
          >
            100%
          </Button>
        </div>
        {props.action}
      </div>
    </div>
  )
}

export default DepositContainer;
