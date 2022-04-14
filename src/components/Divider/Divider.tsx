import React from 'react';
import * as s from './Divider.styl';
interface Props {}

export const Divider: React.FC<Props> = () => {
  return <div className={s.divider} />;
};

Divider.displayName = 'Divider';
