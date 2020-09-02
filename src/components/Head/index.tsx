import * as React from 'react';
import styled, { withTheme } from 'styled-components';
import { Box, BoxProps, Text } from 'grommet';
import { useHistory } from 'react-router';
import { observer } from 'mobx-react-lite';
import { IStyledChildrenProps } from 'interfaces';
import { Title } from '../Base/components/Title';
import { useStores } from '../../stores';
import * as styles from './styles.styl';
import cn from 'classnames';

const MainLogo = styled.img`
  width: auto;
  height: 32px;
`;

export const Head: React.FC<IStyledChildrenProps<BoxProps>> = withTheme(
  observer(({ theme, ...props }: IStyledChildrenProps<BoxProps>) => {
    const history = useHistory();
    const { routing } = useStores();
    const { palette, container } = theme;
    const { minWidth, maxWidth } = container;

    const isExplorer = history.location.pathname === '/explorer';
    const isGetTokens = history.location.pathname === '/get-tokens';

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

          <Box direction="row" align="center" gap="15px">
            {/*<Box>*/}
            {/*  <Text>Select token</Text>*/}
            {/*</Box>*/}

            <Box
              className={cn(
                styles.itemToken,
                isGetTokens ? styles.selected : '',
              )}
              onClick={() => {
                routing.push(`/get-tokens`);
              }}
            >
              <Text>Get tokens</Text>
            </Box>

            <Box
              className={cn(
                styles.itemToken,
                isExplorer ? styles.selected : '',
              )}
              onClick={() => {
                routing.push(`/explorer`);
              }}
            >
              <Text>Explorer</Text>
            </Box>

            <Box
              className={cn(
                styles.itemToken,
                !isExplorer && !isGetTokens ? styles.selected : '',
              )}
              onClick={() => {
                routing.push(`/busd`);
              }}
            >
              <Text>Bridge</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }),
);
