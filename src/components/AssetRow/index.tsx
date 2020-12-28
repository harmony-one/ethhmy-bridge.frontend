import React, { Component } from 'react';
import * as styles from './styles.styl';
import cn from 'classnames';
import { Accordion, Icon, Image, Form, Button, Input } from 'semantic-ui-react';
import SoftTitleValue from '../SoftTitleValue';
import ScrtTokenBalance from '../ScrtTokenBalance';

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

class AssetRow extends Component {
  // return (<div>
  //   <h3 className={cn(styles.scrtAssetBalance)}>{props.title}</h3>
  //   <h5 className={cn(styles.subMenu)}>{props.subTitle}</h5>
  // </div>);
  state = { activeIndex: -1 }

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  };

  render() {
    const { activeIndex } = this.state

    return (
      <Accordion className={cn(styles.accordion)}>
        <Accordion.Title
          active={activeIndex === 0}
          index={0}
          onClick={this.handleClick}
          className={cn(styles.assetRow)}
        >
            <div className={cn(styles.assetIcon)}>
              <Image src={'https://s2.coinmarketcap.com/static/img/coins/32x32/5604.png'} rounded size='mini' />
            </div>
            <div className={cn(styles.assetName)}>
              <SoftTitleValue title={"Secret Ethereum"} subTitle={"sETH"} />
            </div>
            <div className={cn(styles.totalRewards)}>
              <SoftTitleValue title={"5,000,000 sSCRT"} subTitle={"Total Rewards"} />
            </div>
            <div className={cn(styles.availableDeposit)}>
              <SoftTitleValue title={"0.00 sETH"} subTitle={"Available to Deposit"} />
            </div>
            <Icon name='dropdown'/>
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 0}>
          <div className={cn(styles.content2)}>
            <ChangeBalance action={EarnButton(this.props)} balance={Balance("sETH")}/>
            <ChangeBalance action={ClaimButton(this.props)} balance={Balance("sSCRT")}/>
          </div>
        </Accordion.Content>
      </Accordion>);
  }
}

const ChangeBalance = props => {
  return (
    <div className={cn(styles.changeBalance)}>
      <div>
        <div className={cn(styles.balanceRow)}>
          <h3 className={cn(styles.h3)}> </h3>
          {props.balance}
        </div>
        <div>
          <Input placeholder='0.0' className={cn(styles.form)}>
            <input style={{borderRadius: '100px', height: '47px'}} />
          </Input>
        </div>
        <div className={styles.amountRow}>
          <Button style={buttonStyle}>25%</Button>
          <Button style={buttonStyle}>50%</Button>
          <Button style={buttonStyle}>75%</Button>
          <Button style={buttonStyle}>100%</Button>
        </div>
        {props.action}
      </div>
    </div>
  )
}

const Balance = currency => {
  return (<h4 className={cn(styles.h4)}>0.00 {currency}</h4>);
}

const earnButtonStyle = {
  borderRadius: '50px',

  height: '47px',
  fontWeight: 500,
  width: "100%",
  color: "#2F80ED",
  backgroundColor: "transparent",
  border: "1px solid rgba(47, 128, 237, 0.5)",
};

const EarnButton = props => {
  return (
  <Button style={earnButtonStyle}>
    Earn
  </Button>
  );
}

const ClaimButton = props => {
  return (
    <Button style={earnButtonStyle}>
      Claim
    </Button>
  );
}


export default AssetRow;
