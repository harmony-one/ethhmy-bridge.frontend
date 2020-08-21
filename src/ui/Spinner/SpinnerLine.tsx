import * as React from 'react';
import * as s from './SpinnerLine.styl';

export const SpinnerLine: React.FC<React.SVGAttributes<SVGElement>> = props => {
  return <div className={s.spinnerLine} style={props.style} />;
};
