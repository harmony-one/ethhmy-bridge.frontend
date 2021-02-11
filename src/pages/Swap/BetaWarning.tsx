import React from 'react';
import { Message } from 'semantic-ui-react';

export const BetaWarning = () => {
  return (
    <Message warning>
      <Message.Header>Hello beta testers! 👋</Message.Header>
      <p>
        <strong>Getting sSCRT:</strong> get SCRT from the{' '}
        <a href="https://faucet.secrettestnet.io" target="_blank">
          holodeck-2 faucet
        </a>
        {/* , then{' '}
                <a
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    this.props.user.secretjs.execute(
                      process.env.SSCRT_CONTRACT,
                      { deposit: {} },
                      '',
                      [{ amount: '2000000', denom: 'uscrt' }],
                    );
                  }}
                >
                  click here
                </a>{' '}
                to convert to sSCRT */}
      </p>
      <p>
        <strong>Getting sETH:</strong> {/* Via the bridge from the ETH
                rinkeby testnet, or just  */}
        Swap SCRT for it 👆😋
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
          on Discord
        </li>
        <li>
          Tag @assafmo on{' '}
          <a href="https://t.me/SCRTCommunity" target="_blank">
            Telegram
          </a>
        </li>
      </ul>
      <strong>In the works (will be available for mainnet):</strong>
      <ul>
        <li>Withdraw liquidity button</li>
        <li>View pair analytics</li>
        <li>Create a new pair</li>
        <li>Route swapping</li>
        <li>Expert mode (customize slippage, skip approval screens, etc.)</li>
      </ul>
    </Message>
  );
};
