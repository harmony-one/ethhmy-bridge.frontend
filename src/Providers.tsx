import * as React from 'react';
import stores, { StoresProvider } from 'stores';
import { Router } from 'react-router';
import { Provider as MobxProvider } from 'mobx-react';
import { Grommet } from 'grommet';
import { Theme, baseTheme } from 'themes';
import { ApolloProvider } from '@apollo/client/react';
import { client } from 'analytics/client';

export const Providers: React.FC = ({ children }) => (
  <ApolloProvider client={client}>
    <StoresProvider stores={stores as any}>
      <MobxProvider {...stores}>
        <Grommet
          theme={{ ...Theme, ...baseTheme }}
          plain={true}
          full={true}
          id="grommetRoot"
        >
          <Router history={stores.routing.history}>{children}</Router>
        </Grommet>
      </MobxProvider>
    </StoresProvider>
  </ApolloProvider>
);
