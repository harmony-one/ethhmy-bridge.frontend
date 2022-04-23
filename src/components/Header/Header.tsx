import React from 'react';
import { Box } from 'grommet';
import * as s from './Header.styl';
import { HeaderTab } from './components/HeaderTab/HeaderTab';
import { observer } from 'mobx-react';
import { useStores } from '../../stores';

const HeaderLogo = () => {
  return (
    <Box direction="row" align="center">
      <Box>
        <img alt="harmony logo" src="/harmony_logo_blue.svg" />
      </Box>
      <Box direction="column" pad={{ left: '26px' }}>
        <Box>
          <span
            style={{ color: 'white', letterSpacing: '12px', fontSize: '14px' }}
          >
            HORIZON
          </span>
        </Box>
        <Box>
          <span style={{ color: '#AAAAAA', fontSize: '11px' }}>
            <b>by Harmony</b>
          </span>
        </Box>
      </Box>
    </Box>
  );
};

const Account = observer(() => {
  const { userMetamask } = useStores();

  if (!userMetamask.isAuthorized) {
    return null;
  }
  return (
    <div className={s.account}>{userMetamask.ethAddress.slice(0, 8)}...</div>
  );
});

interface Props {}

export const Header: React.FC<Props> = React.memo(() => {
  return (
    <Box className={s.root} direction="row" justify="between" align="center">
      <Box flex={{ grow: 0, shrink: 0 }} basis="150px">
        <HeaderLogo />
      </Box>
      <Box direction="row" alignSelf="end" gap="12px">
        <HeaderTab title="Bridge" to="/busd" />
        <HeaderTab title="Assets" to="/tokens" />
        <HeaderTab title="iToken" to="/itokens" />
        <HeaderTab title="Transactions" to="/explorer" />
        <HeaderTab title="Need Help" to="/help" />
        <HeaderTab title="FAQ" to="/faq" />
      </Box>
      <Box flex={{ grow: 0, shrink: 0 }} align="end" basis="150px">
        <Account />
      </Box>
    </Box>
  );
});

Header.displayName = 'Header';
