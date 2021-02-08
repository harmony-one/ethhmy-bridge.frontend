import React from 'react';
import { TokenDisplay } from '../index';
import * as styles from './styles.styl';
import cn from 'classnames';
import { TokenButton } from './TokenButton';

export const TokenSelectorButton = (props: {
  token?: TokenDisplay;
  onClick?: any;
}) => {
  const isEmpty = !props?.token;

  return isEmpty ? (
    <button className={cn(styles.selectATokenButton)} onClick={props.onClick}>
      Select A token
    </button>
  ) : (
    <TokenButton token={props.token} onClick={props.onClick} />
  );
};
