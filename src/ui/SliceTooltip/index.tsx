import { sliceByLength } from 'utils';
import ReactTooltip from 'react-tooltip';
import * as React from 'react';

export const SliceTooltip = (props: { value: any; maxLength: number }) => {
  if (typeof props.value !== 'string') {
    return props.value;
  }

  return props.value.length > props.maxLength ? (
    <>
      <a data-tip={props.value}>
        {sliceByLength(props.value, props.maxLength)}
      </a>
      <ReactTooltip place="top" type="dark" effect="solid" />
    </>
  ) : (
    props.value
  );
};
