import React, { useState } from 'react';
import SoftTitleValue from '../../components/Earn/SoftTitleValue';
import { flexRowSpace, TokenDisplay } from './index';
import { Image } from 'semantic-ui-react';
import cn from 'classnames';
import * as styles from './styles.styl';

import { CopyWithFeedback } from './CopyWithFeedback';

export const TokenInfoRow = (props: { token: TokenDisplay; balance?: number; onClick?: any }) => {
  return (
    <div style={{ display: 'flex' }}>
      <div className={cn(styles.tokenInfoRow)} onClick={props.onClick}>
        <div className={cn(styles.tokenInfoItemsLeft)}>
          <Image src={props.token.logo} avatar style={{ boxShadow: 'rgba(0, 0, 0, 0.075) 0px 6px 10px' }} />
          <SoftTitleValue title={props.token.symbol} subTitle={props.token.symbol} />
        </div>
        {flexRowSpace}
        <h3 className={cn(styles.tokenInfoItemsRight)}>{props.token.address ?? 'native'}</h3>
      </div>
      <h3 style={{ margin: 'auto' }} hidden={!props.token.address}>
        <CopyWithFeedback text={props.token.address} />
      </h3>
    </div>
  );
};
