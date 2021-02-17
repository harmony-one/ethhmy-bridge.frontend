import React from 'react';
import * as styles from './styles.styl';
import cn from 'classnames';

const SoftTitleValue = (props: { title: string | JSX.Element; subTitle?: string | JSX.Element }) => {
  if (props.subTitle) {
    return (
      <div>
        <h3 className={cn(styles.scrtAssetBalance)}>{props.title}</h3>
        <h5 className={cn(styles.subMenu)}>{props.subTitle}</h5>
      </div>
    );
  } else {
    return (
      <div>
        <h5 className={cn(styles.subMenu)}>{props.title}</h5>
      </div>
    );
  }
};

export default SoftTitleValue;
