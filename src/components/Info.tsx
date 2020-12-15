import React from 'react';
import { Box } from 'grommet';
import { Title } from './Base/components/Title';
import * as styles from './info-styles.styl';

export const Info = ({ title }: { title: string }) => (
  <Box
    className={styles.infoContainer}
    pad={{ horizontal: 'large', top: 'large' }}
  >
    {title ? (
      <Box direction="row" justify="center" margin={{ bottom: 'medium' }}>
        <Title>{title}</Title>
      </Box>
    ) : null}
    <div>
      <p>
        <b>You can use this bridge to</b>
        <ul>
          <li>1) Swap ERC-20s, or Ethereum to Secret Tokens</li>
          <li>
            2) Currently supported tokens: ETH, OCEAN, YFI, UNI, TUSD, SNX, MKR,
            DAI, BAND, LINK, AAVE, COMP, KNC and WBTC.
          </li>
        </ul>
      </p>
      <p>
        Because of volatility of gas prices on Ethereum, the swap transaction
        fee will be shown before the transaction is aproved by the user.
      </p>

      <p>
        You can also do the reverse transfer, i.e., redeem your tokens back to
        your ethereum account. This will cost you SCRT gas, and a fee of about 500K gas,
        in the denomination that is being withdrawn to cover the multisig transaction costs.
      </p>
      <p>
        <b>
          Report any issues in the <strong>#🌉bridge-support</strong> channel on
          the{' '}
          <a href="http://chat.scrt.network/" target="_blank">
            Secret Network Discord server
          </a>{' '}
          with one or more of the following information:
        </b>
        <ul>
          <li>
            1) Transaction id, e.g.,{' '}
            <span>7fa14f19-219f8220-1f209e61-8911e539</span> in . Every bridge
            operation is associated with a unique transaction id, which is
            available in your webpage URL. If you didn't store the transaction
            id, it is okay, follow 2) or 3)
          </li>
          <li>2) your transaction hashes on Ethereum or Secret Network</li>
          <li>
            3) your <span>ETH</span> or <span>Secret</span> account address
          </li>
        </ul>
      </p>
      <p>
        <b>Disclaimer</b>
        <br />
          Use at your own risk. We take no responsibilities or any liability for any claim, damages
        or other liabilities that may arise from use of this software.
      </p>
    </div>
  </Box>
);

