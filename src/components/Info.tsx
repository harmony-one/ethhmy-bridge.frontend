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
          <li>
            1) Swap ERC-20s, or Ethereum to Secret Tokens
          </li>
          <li>
            2) Currently supported tokens: TBD
          </li>
        </ul>
      </p>
      <p>
        <b>
          Each Etheruem to Secret swap requires two actions - allowance, and a swap transaction.
          These will be handled automagically by the bridge
        </b>
      </p>
      <p>
        The swap transaction should cost about TBD gas.
      </p>

      <p>
        You can also do the reverse transfer, i.e., redeem your tokens back to
        your ethereum account. This will cost you SCRT gas, and a small fee to cover the multisig
        transaction on the Ethereum side.
      </p>
      <p>
        Please find more instructions{' '}
        <a
          href="https://docs.harmony.one/home/showcases/crosschain/horizon-bridge"
          target="_blank"
        >
          <b>here</b>
        </a>
      </p>
      <p>
        <b>
          Report any issues to <span>info@enigma.co</span> with one or more
          of the following informations:
        </b>
        <ul>
          <li>
            1) Transaction id, e.g.,{' '}
            <span>7fa14f19-219f8220-1f209e61-8911e539</span> in{' '}
            . Every bridge operation is associated with a unique transaction id,
            which is available in your webpage URL. If you didn't store the
            transaction id, it is okay, follow 2) or 3)
          </li>
          <li>2) your transaction hashes on Ethereum or Secret Network</li>
          <li>
            3) your <span>ETH</span> or <span>Secret</span> account address
          </li>
        </ul>
      </p>
      <p>
        Please allow 24-48 hours for your issue resolution. Happy Bridging!!!
      </p>
    </div>
  </Box>
);

// Also add a Contact Us button that mailsTo: bridge@harmony.one
