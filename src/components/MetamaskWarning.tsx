import React from 'react';
import { Box } from 'grommet';
import { Title } from './Base/components/Title';

export const MetamaskWarning = () => (
  <Box pad={{ horizontal: 'large', top: 'large' }}>
    <Title>Wrong network selected</Title>
    <div>
      <p>
        You are currently not on the Harmony network in Metamask. Please choose Harmony mainnet to continue.
        (
        <a
          href="https://docs.harmony.one/home/developers/wallets/metamask"
          target="_blank"
          rel="noopener norefferer"
        >
          How to add Harmony RPC to Metamask
        </a>
        )
      </p>
    </div>
  </Box>
);
