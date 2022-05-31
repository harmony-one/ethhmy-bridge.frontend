import React from 'react';
import { Box } from 'grommet';
import { Title, Text } from './Base';

export const MetamaskWarning = () => (
  <Box pad="large">
    <Title>Wrong network selected</Title>
    <Text color="NWhite">
      <p>
        You are currently not on the Harmony network in MetaMask. Please choose
        Harmony mainnet to continue. (
        <a
          href="https://docs.harmony.one/home/developers/wallets/metamask"
          target="_blank"
          rel="noopener norefferer"
        >
          How to add Harmony RPC to MetaMask
        </a>
        )
      </p>
    </Text>
  </Box>
);
