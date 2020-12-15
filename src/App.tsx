import * as React from 'react';
import { baseTheme } from 'themes';
import { GlobalStyle } from './GlobalStyle';
import { Providers } from './Providers';
import { Redirect, Route, Switch } from 'react-router';
import { ActionModals } from './components/ActionModals';
import { EthBridge } from './pages/EthBridge';
import { Explorer } from './pages/Explorer';
import { Tokens } from './pages/Tokens';
import { FAQPage } from './pages/FAQ';

export const App: React.FC = () => (
  <Providers>
    <React.Suspense fallback={<div />}>
      <Switch>
        <Route exact path="/tokens" component={Tokens} />
        <Route exact path="/faq" component={FAQPage} />
        <Route exact path="/explorer" component={Explorer} />
        <Route exact path="/:token" component={EthBridge} />
        <Route
          exact
          path="/:token/operations/:operationId"
          component={EthBridge}
        />
        <Redirect to="/eth" />
      </Switch>
    </React.Suspense>
    <ActionModals />
    <GlobalStyle theme={...baseTheme as any} />
  </Providers>
);
