import React from 'react';
import SoftTitleValue from '../../components/Earn/SoftTitleValue';
import { TokenDisplay } from './index';
import { Image } from 'semantic-ui-react';
import cn from 'classnames';
import * as styles from './styles.styl';

export const TokenInfoRow = (props: { token: TokenDisplay; balance?: number; onClick?: any }) => {
  return (
    <div className={cn(styles.tokenInfoRow)} onClick={props.onClick}>
      <div className={cn(styles.tokenInfoItemsLeft)}>
        <Image src={props.token.logo} rounded style={{ borderRadius: '24px', height: '24px', width: '24px' }} />
        <SoftTitleValue title={props.token.symbol} subTitle={props.token.symbol} />
      </div>
      <h3 className={cn(styles.tokenInfoItemsRight)}>{props.token.address || 'native'}</h3>
    </div>
  );
};
