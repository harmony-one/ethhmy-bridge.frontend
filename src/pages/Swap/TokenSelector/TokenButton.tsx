import * as styles from './styles.styl';
import cn from 'classnames';
import React from 'react';
import { Image } from 'semantic-ui-react';
import { ExpandIcon } from '../../../ui/Icons/ExpandIcon';
import { SwapToken } from '../types/SwapToken';
import { truncateSymbol } from '../../../utils';

export const TokenButton = (props: { token: SwapToken; onClick?: any }) => {
  return (
    <div className={cn(styles.tokenButton)} onClick={props.onClick}>
      <Image src={props.token.logo} avatar style={{ boxShadow: 'rgba(0, 0, 0, 0.075) 0px 6px 10px' }} />
      <span>{truncateSymbol(props.token.symbol)}</span>
      <ExpandIcon />
    </div>
  );
};
