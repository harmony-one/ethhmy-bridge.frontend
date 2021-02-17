import React from 'react';
import { SigningCosmWasmClient } from 'secretjs';
import { Message } from 'semantic-ui-react';

export const BetaWarning = ({ secretjs }: { secretjs: SigningCosmWasmClient }) => {
  if (process.env.ENV === 'MAINNET') {
    return null;
  }

  return (
    <Message warning>
      <Message.Header>Hello beta testers! 👋</Message.Header>
      <p>
        <strong>Getting sSCRT:</strong> get SCRT from the{' '}
        <a href="https://faucet.secrettestnet.io" target="_blank">
          holodeck-2 faucet
        </a>
        , then{' '}
        <a
          style={{ cursor: 'pointer' }}
          onClick={() => {
            secretjs.execute(process.env.SSCRT_CONTRACT, { deposit: {} }, '', [{ amount: '10000000', denom: 'uscrt' }]);
          }}
        >
          click here
        </a>{' '}
        to convert to sSCRT
      </p>
      <p>
        <strong>Getting sETH:</strong> {/* Via the bridge from the ETH
                rinkeby testnet, or just  */}
        Swap sSCRT for it 👆😋
      </p>
      <strong>Feedback channels:</strong>
      <ul>
        <li>
          Open a{' '}
          <a href="https://github.com/enigmampc/EthereumBridgeFrontend/issues/new" target="_blank">
            GitHub issue
          </a>
        </li>
        <li>
          <a href="https://discord.com/channels/360051864110235648/805840792303960155" target="_blank">
            #🔀amm-support
          </a>{' '}
          on{' '}
          <a href="https://chat.scrt.network" target="_blank">
            Discord
          </a>
        </li>
        <li>
          Tag @assafmo on{' '}
          <a href="https://t.me/SCRTCommunity" target="_blank">
            Telegram
          </a>
        </li>
      </ul>
    </Message>
  );
};
