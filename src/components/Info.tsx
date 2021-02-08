import React from 'react';
import { Box } from 'grommet';
import { Title } from './Base/components/Title';
import * as styles from './info-styles.styl';

/*
You can use this bridge to
1) send your Ethereum BUSD, LINK, any other ERC20, any ERC721 to Harmony
2) send the bridged tokens back to Ethereum
3) send ONE tokens or any HRC20 from Harmony to Ethereum

Ethereum to Harmony transfer requires user sign two transactions and the total cost is approximately the price for 100,000 Ethereum gas:
1) approve token lock
2) the actual lock

Harmony to Ethereum transfer requires user sign three transactions and the total cost is approximately the price for 400,000 Ethereum gas:
1) deposit network fee
2) approve burn bridged token or approve token lock
3) burn bridged token or lock token

The user guide with detailed instructions are here.

Report any issues to bridge@harmony.one with one or more of the following informations:
1) operation id, e.g., 7fa14f19-219f8220-1f209e61-8911e539 in https://bridge.harmony.one/busd/operations/7fa14f19-219f8220-1f209e61-8911e539. Every bridge operation is associated with a unique operation id, which is available in your webpage URL. If you didn't store the operation id, it is okay, follow 2) or 3)
2) your transaction hashes on Ethereum or Harmony
3) your ETH or ONE account address

Please allow 24-48 hours for your issue resolution. Happy Bridging!!!
*/

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
            1) send your <span>Ethereum BUSD</span>, <span>LINK</span>, any
            other <span>ERC20</span>, any <span>ERC721</span> to Harmony
          </li>
          <li>2) send the bridged tokens back to Ethereum</li>
          <li>
            3) send <span>ONE</span> tokens or any <span>HRC20</span> from
            Harmony to Ethereum
          </li>
        </ul>
      </p>
      <p>
        <b>
          Ethereum to Harmony transfer requires user sign two transactions and
          the total cost is approximately the price for <span>100,000</span>{' '}
          Ethereum gas:
        </b>
        <ul>
          <li>1) approve token lock</li>
          <li>2) the actual lock</li>
        </ul>
      </p>
      <b>
        Harmony to Ethereum transfer requires user sign three transactions and
        the total cost is approximately the price for <span>400,000</span>{' '}
        Ethereum gas:
      </b>
      <ul>
        <li>1) deposit network fee</li>
        <li>2) approve burn bridged token or approve token lock</li>
        <li>3) burn bridged token or lock token</li>
      </ul>

      <p>
        The user guide with detailed instructions are{' '}
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
            3) your <span>ETH</span> or <span>ONE</span> account address
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
