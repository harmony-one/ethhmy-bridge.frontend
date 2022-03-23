import React from 'react';
import { Box } from 'grommet';
import * as s from './Header.styl';
import { HeaderTab } from './components/HeaderTab/HeaderTab';

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

const Account = () => {
  return <Box className={s.account}>0x4391sa...</Box>;
};

interface Props {}

export const Header: React.FC<Props> = React.memo(() => {
  return (
    <Box className={s.root} direction="row" justify="between" align="center">
      <Box>
        <HeaderLogo />
      </Box>
      <Box direction="row" alignSelf="end">
        <HeaderTab title="Bridge" to="/busd" />
        <HeaderTab title="Assets" to="/tokens" />
        <HeaderTab title="Transactions" to="/explorer" />
      </Box>
      <Box>
        <Account />
      </Box>
    </Box>
  );
});

Header.displayName = 'Header';
