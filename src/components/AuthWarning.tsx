import React from 'react';
import { Box } from 'grommet';
import { Title } from './Base/components/Title';

export const AuthWarning = () => (
  <Box pad={{ horizontal: 'large', top: 'large' }}>
    <Title>Use Keplr Wallet Browser Extension</Title>
    <div>
      <p>
        Looks like you don't have the Keplr Wallet extension installed
        yet. Head over to the
        <a
          href="https://wallet.keplr.app/"
          target="_blank"
          rel="noopener norefferer"
        >
          Keplr Wallet
        </a>
        to quickly install the extension.
      </p>
    </div>
  </Box>
);
