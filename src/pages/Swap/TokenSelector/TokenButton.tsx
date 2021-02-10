import { TokenDisplay } from '../index';
import * as styles from './styles.styl';
import cn from 'classnames';
import React from 'react';
import { Icon, Image } from 'semantic-ui-react';

export const TokenButton = (props: { token: TokenDisplay; onClick?: any }) => {
  return (
    <div className={cn(styles.tokenButton)} onClick={props.onClick}>
      <Image
        src={props.token.logo}
        rounded
        size="mini"
        style={{
          boxShadow: 'rgba(0, 0, 0, 0.075) 0px 6px 10px',
          borderRadius: '24px',
          height: '28px',
          width: '28px',
        }}
      />
      <span>{props.token.symbol}</span>
      <Icon name="dropdown" style={{ margin: 'auto' }} />
    </div>
  );
};
