import * as React from 'react';
import styled, { withTheme } from 'styled-components';
import { BoxProps, Box } from 'grommet';
import { useHistory } from 'react-router';
import { observer } from 'mobx-react-lite';
import { Routes } from 'constants/routes';
import { Text } from 'grommet';
import { IStyledChildrenProps } from 'interfaces';
import { Title } from '../Base/components/Title';
import { Icon } from '../Base/components/Icons';
import { useStores } from '../../stores';
import { Button } from '../Base/components/Button';
import { AuthWarning } from '../AuthWarning';
import { formatWithTwoDecimals, ones } from '../../utils';

const MainLogo = styled.img`
  width: auto;
  height: 32px;
`;

export const Head: React.FC<IStyledChildrenProps<BoxProps>> = withTheme(
  observer(({ theme }: IStyledChildrenProps<BoxProps>) => {
    const history = useHistory();
    const { user, actionModals } = useStores();
    const { palette, container } = theme;
    const { minWidth, maxWidth } = container;
    return (
      <Box
        style={{
          background: palette.StandardWhite,
          // background: '#f6f7fb',
          overflow: 'visible',
          position: 'absolute',
          top: 0,
          width: '100%',
          zIndex: 100,
          // boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Box
          direction="row"
          align="center"
          justify="between"
          style={{
            minWidth,
            maxWidth,
            margin: '0 auto',
            padding: '0px 30px',
            height: 100,
            minHeight: 100,
            width: '100%',
          }}
        >
          <Box direction="row" align="center">
            <Box align="center" margin={{ right: 'small' }}>
              <MainLogo src="/main_logo.png" />
            </Box>
            <Box>
              <Title size="medium" color="BlackTxt" bold>
                {/*BUSD Bridge*/}
              </Title>
            </Box>
          </Box>

          <Box direction="row" align="center" style={{ visibility: 'hidden' }}>
            {/*<Box style={{ flex: '1 1 100%' }} />*/}

            {user.isAuthorized ? (
              <Box direction="row" justify="end" align="center">
                <Box dir="column">
                  <Text color="rgb(164, 168, 171)" size="small">
                    You authorised with ONE Wallet as:
                  </Text>
                  {user.address}
                  {/*<Text size="small">*/}
                  {/*  Balance: {formatWithTwoDecimals(ones(user.balance))} ONEs*/}
                  {/*</Text>*/}
                </Box>
                <Box
                  onClick={() => {
                    user.signOut().then(() => {
                      history.push(`/${Routes.login}`);
                    });
                  }}
                  margin={{ left: 'medium' }}
                >
                  <Icon
                    glyph="Logout"
                    size="24px"
                    style={{ opacity: 0.5 }}
                    color="BlackTxt"
                  />
                </Box>
              </Box>
            ) : (
              <Box
                direction="row"
                justify="end"
                align="center"
                style={{ marginRight: 2, marginTop: 2 }}
              >
                <Button
                  style={{ width: 180 }}
                  onClick={() => {
                    if (!user.isOneWallet) {
                      actionModals.open(() => <AuthWarning />, {
                        title: '',
                        applyText: 'Got it',
                        closeText: '',
                        noValidation: true,
                        width: '500px',
                        showOther: true,
                        onApply: () => Promise.resolve(),
                      });
                    } else {
                      user.signIn();
                    }
                  }}
                >
                  Connect Wallet
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  }),
);
