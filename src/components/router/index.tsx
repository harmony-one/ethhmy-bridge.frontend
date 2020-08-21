import * as React from 'react';
import { RedirectProps, Redirect, useLocation } from 'react-router';
import { useStores } from 'stores';
import { observer } from 'mobx-react-lite';

export const RedirectEx: React.FC<RedirectProps> = observer(props => {
  const { user } = useStores();
  const { pathname, search } = useLocation();
  user.saveRedirectUrl(pathname + search);
  return <Redirect {...props} />;
});

export * from './AuthenticationGuard';
