import React from 'react';
import { Box } from 'grommet';
import { Title } from './Base/components/Title';
import * as styles from './info-styles.styl';

export const Info = ({ title }: { title: string }) => (
  <Box className={styles.infoContainer} pad={{ horizontal: 'large', top: 'large' }}>
    {title ? (
      <Box direction="row" justify="center" margin={{ bottom: 'medium' }}>
        <Title>{title}</Title>
      </Box>
    ) : null}
    <div>
      <p>
        <b>You can use this bridge to</b>
        <ul>
          <li>1. Swap ERC-20s, or Ethereum to Secret Tokens for transactional privacy.</li>
          <li>2. Lock Secret Tokens to increase anonymity guarantees of the bridge and earn SCRT rewards.</li>
          <li>
            3. Redeem tokens back to an Ethereum address
            <br />
            Currently supported tokens: ETH, OCEAN, YFI, UNI, TUSD, SNX, MKR, DAI, BAND, LINK, AAVE, COMP, KNC, USDT,
            WBTC and BAC.
          </li>
        </ul>
      </p>
      <p>
        Users need to connect their Ethereum wallet and Keplr Wallet (Secret Network) in order to use the bridge.
        Download Keplr Wallet chrome extension{' '}
        <a
          href="https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en"
          target="_blank"
          rel="noreferrer"
        >
          using this link
        </a>{' '}
        .
      </p>

      <p>
        <b>Fees</b>
        <br />
        The total cost of using the bridge (ETH→secretETH→ETH) is about 500K gas.{' '}
        <b>There will also be an airdrop of SCRT to help users pay TX fees on Secret Network.</b>
        <ul>
          <li>
            ● Locking assets on Ethereum <br />
            Users will pay gas on ETH when assets are being locked on Ethereum to mint secretTokens. Because of
            volatility of gas prices on Ethereum, the swap transaction fee will be shown before the transaction is
            approved by the user.
          </li>
          <li>
            ● Redeeming assets from Secret Network <br />
            Users will pay SCRT gas, and a fee of about 500K gas, in the denomination that is being withdrawn to cover
            the multisig transaction costs. As a result, users will redeem their tokens minus the multisig transaction
            cost on their Ethereum address.
          </li>
        </ul>
      </p>

      <p>
        <b>Viewing keys</b>
        <br />
        Viewing key is a new concept introduced by Secret Network given the encrypted nature of secret contracts. Secret
        Tokens are privacy tokens and in order to view secret token balances users need to create viewing keys for each
        asset. All Ethereum assets minted on Secret Network are privacy tokens and require viewing keys to view
        balances. Bridge mining rewards are distributed in secretSCRT, which is the a privacy token for SCRT. Uses will
        need to generate viewing keys for secretSCRT to view their reward balances in the Earn page.
      </p>

      <p>
        <b>Issues</b>
        <br />
        Report any issues in the <strong>#🌉bridge-support</strong> channel on the{' '}
        <a href="https://chat.scrt.network/" target="_blank" rel="noreferrer">
          Secret Network Discord server
        </a>{' '}
        with one or more of the following information:
        <ul>
          <li>
            1. Transaction id, e.g., <span>7fa14f19-219f8220-1f209e61-8911e539</span>. Every bridge operation is
            associated with a unique transaction id, which is available in your webpage URL. If you didn't store the
            transaction id, it is okay, follow 2) or 3).
          </li>
          <li>2. Your transaction hashes on Ethereum or Secret Network.</li>
          <li>
            3. Your <span>ETH</span> or <span>Secret</span> account address.
          </li>
        </ul>
      </p>
      <p>
        <b>Disclaimer</b>
        <br />
        Use at your own risk. We take no responsibilities or any liability for any claim, damages or other liabilities
        that may arise from use of this software.
      </p>
    </div>
  </Box>
);
