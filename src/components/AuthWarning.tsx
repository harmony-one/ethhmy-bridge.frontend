import React from 'react';
import { Box } from 'grommet';
import { Title, Text } from './Base';

export const AuthWarning = () => (
  <Box pad="large">
    <Title>Use ONE Wallet Browser Extension</Title>
    <Text color="NWhite">
      <p>
        Looks like you don't have the Harmony One Wallet extension installed
        yet. Head over to the
        <a
          href="https://chrome.google.com/webstore/detail/harmony-one-wallet/fnnegphlobjdpkhecapkijjdkgcjhkib"
          target="_blank"
          rel="noopener norefferer"
        >
          Harmony One Wallet
        </a>
        to quickly install the extension.
      </p>
    </Text>
  </Box>
);
