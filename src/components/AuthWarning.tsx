import React from 'react';
import { Box } from 'grommet';
import { Title } from './Base/components/Title';

export const AuthWarning = () => (
  <Box pad={{ horizontal: 'large', top: 'large' }}>
    <Title>Use ONE Wallet Browser Extension</Title>
    <div>
      <p>
        Looks like you don't have the Harmony One Wallet extension installed
        yet. Head over to the
        <a
          href="https://chrome.google.com/webstore/detail/harmony-one-wallet/gldpceolgfpjnajainimdfghhhgcnfmf"
          target="_blank"
          rel="noopener norefferer"
        >
          Harmony One Wallet
        </a>
        to quickly install the extension.
      </p>
    </div>
  </Box>
);
