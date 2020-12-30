import React, { Suspense, lazy } from 'react';
import { baseTheme } from 'themes';
import { GlobalStyle } from './GlobalStyle';
import { Providers } from './Providers';
import { Redirect, Route, Switch } from 'react-router';
import { ActionModals } from './components/ActionModals';
//import { EthBridge } from './pages/EthBridge';
//import { Explorer } from './pages/Explorer';
//import { Tokens } from './pages/Tokens';
//import { SwapPage } from './pages/Swap';
import { InfoModal } from './components/InfoModal';
// import { EarnRewards } from './pages/Earn';
// import { FAQPage } from './pages/FAQ';

// import { InfoPage } from './pages/Info';

const EthBridge = lazy(() => import('./pages/EthBridge'));
const SwapPage = lazy(() => import('./pages/Swap'));
const Tokens = lazy(() => import('./pages/Tokens'));
const Explorer = lazy(() => import('./pages/Explorer'));
const EarnRewards = lazy(() => import('./pages/Earn'));
const FAQPage = lazy(() => import('./pages/FAQ'));

export const App: React.FC = () => (
  <Providers>
    <Suspense fallback={<div />}>
      <Switch>
        <Route exact path="/swap" component={SwapPage} />
        <Route exact path="/tokens" component={Tokens} />
        <Route exact path="/faq" component={FAQPage} />
        {/* <Route exact path="/info" component={InfoPage} /> */}
        <Route exact path="/explorer" component={Explorer} />
        <Route exact path="/earn" component={EarnRewards} />
        <Route exact path="/:token" component={EthBridge} />
        <Route
          exact
          path="/:token/operations/:operationId"
          component={EthBridge}
        />
        <Redirect to="/eth" />
      </Switch>
    </Suspense>
    <ActionModals />
    <InfoModal />
    <GlobalStyle theme={...baseTheme as any} />
  </Providers>
);
