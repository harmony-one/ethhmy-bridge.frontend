import React from 'react';
import { Message } from 'semantic-ui-react';
import BigNumber from 'bignumber.js';
import { PriceRow } from './PriceRow';

export const NewPoolWarning = (props: { inputA: string; inputB: string; tokenA: string; tokenB: string }) => {
  return (
    <div
      style={{
        display: 'flex',
        paddingTop: '0.5rem',
      }}
    >
      <Message warning style={{ borderRadius: '20px' }}>
        <Message.Header>Pair without liquidity!</Message.Header>
        <p>This trading pair has no liquidity. By providing liquidity you are setting the price.</p>
        {(() => {
          const newPrice = new BigNumber(props.inputA).dividedBy(props.inputB);

          return newPrice.isNaN() ? null : (
            <PriceRow fromToken={props.tokenA} toToken={props.tokenB} price={newPrice.toNumber()} labelPrefix="New " />
          );
        })()}
      </Message>
    </div>
  );
};
