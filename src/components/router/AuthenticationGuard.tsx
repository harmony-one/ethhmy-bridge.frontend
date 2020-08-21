import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';

interface Props {
  render: (props: { isAuthenticated: boolean }) => React.ReactNode;
}

export const AuthenticationGuard = observer(({ render }: Props) => {
  const { user } = useStores();
  if (user.status === 'fetching' || user.status === 'success') {
    return null;
  }

  return (
    <>
      {render({
        isAuthenticated: true,
      })}
    </>
  );
});
