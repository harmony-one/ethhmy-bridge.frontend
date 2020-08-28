import * as React from 'react';
import styled, { withTheme } from 'styled-components';
import { Box, BoxProps, Text } from 'grommet';
import { useHistory } from 'react-router';
import { observer } from 'mobx-react-lite';
import { IStyledChildrenProps } from 'interfaces';
import { Title } from '../Base/components/Title';
import { useStores } from '../../stores';
import { TOKEN } from '../../stores/interfaces';
import * as styles from './styles.styl';
import cn from 'classnames';

const MainLogo = styled.img`
  width: auto;
  height: 32px;
`;

export const Head: React.FC<IStyledChildrenProps<BoxProps>> = withTheme(
  observer(({ theme }: IStyledChildrenProps<BoxProps>) => {
    const history = useHistory();
    const { exchange, routing } = useStores();
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

          <Box direction="row" align="center" gap="15px">
            {/*<Box>*/}
            {/*  <Text>Select token</Text>*/}
            {/*</Box>*/}

            <Box
              className={cn(
                styles.itemToken,
                exchange.token === TOKEN.BUSD ? styles.selected : '',
              )}
              onClick={() => {
                exchange.setToken(TOKEN.BUSD);
                routing.push(`/${exchange.token}`);
              }}
            >
              <img className={styles.imgToken} src="/busd.svg" />
              <Text>BUSD</Text>
            </Box>

            <Box
              className={cn(
                styles.itemToken,
                exchange.token === TOKEN.LINK ? styles.selected : '',
              )}
              onClick={() => {
                exchange.setToken(TOKEN.LINK);
                routing.push(`/${exchange.token}`);
              }}
            >
              <img className={styles.imgToken} src="/link.png" />
              <Text>LINK</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }),
);
