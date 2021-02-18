import React from 'react';
import * as styles from './styles.styl';
import cn from 'classnames';
import { TokenButton } from './TokenButton';
import { SwapToken } from '../types/SwapToken';

export const TokenSelectorButton = (props: { token?: SwapToken; onClick?: any }) => {
  const isEmpty = !props?.token;

  return isEmpty ? (
    <button className={cn(styles.selectATokenButton)} onClick={props.onClick}>
      Select a token
    </button>
  ) : (
    <TokenButton token={props.token} onClick={props.onClick} />
  );
};
