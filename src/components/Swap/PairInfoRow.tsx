import React from 'react';

export const PairInfoRow = (props: { itemLeft: any; itemRight: any }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>{props.itemLeft}</div>
      <div>{props.itemRight}</div>
    </div>
  );
};
