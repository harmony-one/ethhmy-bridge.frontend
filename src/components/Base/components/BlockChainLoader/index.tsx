import cn from 'classnames';
import * as React from 'react';

import styles from './styles.styl';

interface IProps {
  size?: 'small';
  color?: string;
}

export const BlockChainLoader: React.FunctionComponent<IProps> = ({
  size = 'normal',
  color = '',
  ...props
}) => (
  <div {...props}>
    <div
      className={cn(styles['sk-folding-cube'], styles[size], [
        styles[`sk-folding-cube_color_${color}`],
      ])}
    >
      <div className={cn(styles['sk-cube1'], styles['sk-cube'])} />
      <div className={cn(styles['sk-cube2'], styles['sk-cube'])} />
      <div className={cn(styles['sk-cube4'], styles['sk-cube'])} />
      <div className={cn(styles['sk-cube3'], styles['sk-cube'])} />
    </div>
  </div>
);
