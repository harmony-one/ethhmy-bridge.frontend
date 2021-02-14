import React from 'react';
import Style from 'style-it';

export const UnlockJsx = (props: { keplrWallet: any; chainId: string; address: string }) =>
  Style.it(
    `.view-token-button {
      cursor: pointer;
      border-radius: 30px;
      padding: 0 0.6em 0 0.3em;
      border: solid;
      border-width: thin;
      border-color: whitesmoke;
    }

    .view-token-button:hover {
      background: whitesmoke;
    }`,
    <span
      role="img"
      aria-label="view"
      className="view-token-button"
      onClick={async _e => {
        await props.keplrWallet.suggestToken(props.chainId, props.address);
        // TODO trigger balance refresh if this was an "advanced set" that didn't
        // result in an on-chain transaction
      }}
    >
      🔍 View
    </span>,
  );
