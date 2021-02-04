import React from 'react';
import cn from 'classnames';
import * as styles from './styles.styl';
import { Image } from 'semantic-ui-react';

const PairIcons = (props: {
  image0,
  image1
}) => {
  return (
  <div className={cn(styles.assetIcons)}>
    <Image
      src={props.image0}
      rounded
      size="mini"
    />
    <Image
      src={props.image1}
      rounded
      size="mini"
    />
  </div>
  );
}

export default PairIcons;
