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
            1) send your ethereum <span>BUSD</span> to harmony
          </li>
          <li>
            2) send your ethereum <span>LINK</span> to harmony
          </li>
          <li>
            3) send any <span>ERC20</span> from ethereum to harmony
          </li>
        </ul>
      </p>
      <p>
        <b>
          Each Ethereum to Harmony transfer requires two transactions to be
          signed by the user:
        </b>
        <ul>
          <li>1) approve token lock</li>
          <li>2) the actual lock</li>
        </ul>
      </p>
      <p>
        Each of these two ETH transactions may cost you: 0.0001 to 0.0075 Ether
        (or $1 to $2.6 at $350/ether)
      </p>

      <p>
        You can also do the reverse transfer, i.e., redeem your tokens back to
        your ethereum account. The cost is bared by Harmony and you will only
        pay for Harmony gas (which is a small fraction of a cent).
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
          Report any issues to <span>bridge@harmony.one</span> with one or more
          of the following informations:
        </b>
        <ul>
          <li>
            1) operation id, e.g.,{' '}
            <span>7fa14f19-219f8220-1f209e61-8911e539</span> in{' '}
            <span>
              https://bridge.harmony.one/busd/operations/7fa14f19-219f8220-1f209e61-8911e539
            </span>
            . Every bridge operation is associated with a unique operation id,
            which is available in your webpage URL. If you didn't store the
            operation id, it is okay, follow 2) or 3)
          </li>
          <li>2) your transaction hashes on Ethereum or Harmony</li>
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
