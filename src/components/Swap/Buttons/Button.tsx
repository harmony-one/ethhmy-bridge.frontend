import { Button } from 'semantic-ui-react';
import cn from 'classnames';
import * as styles from '../../Earn/EarnRow/styles.styl';
import React from 'react';

export const SwapButton = (props: {
  loading?: boolean;
  onClick?: any;
  text?: string;
}) => {
  const { loading, onClick, text } = props;
  return (
    <button className={cn(styles.button)} onClick={onClick}>
      {text}
    </button>
  );
};
