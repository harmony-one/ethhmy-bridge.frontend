import * as React from 'react';
import { Box, Text } from 'grommet';
import { Title } from '../Base/components/Title';
import * as styles from './styles.styl';
import cn from 'classnames';
import { Icon } from 'components/Base/components/Icons';

export const MainFooter: typeof Box = props => (
  <Box
    flex={{ shrink: 0 }}
    style={{
      borderTop: '1px solid rgb(231, 236, 247)',
      backgroundColor: '#1c2a5e',
      overflow: 'visible',
      width: '100%',
      zIndex: 100,
      minWidth: '550px',
      paddingTop: '64px',
      paddingBottom: '64px',
    }}
    direction="row"
    justify="end"
    pad={{ horizontal: 'xlarge', vertical: 'large' }}
    {...props}
  >
    <Box
      direction="row"
      align="center"
      gap="89px"
      style={{
        minWidth: '550px',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0px 30px',
        //height: 100,
        //minHeight: 100,
        width: '100%',
        alignItems: 'start',
      }}
    >
      <Box direction="row" align="baseline">
        <a href="https://scrt.network/" style={{ textDecoration: 'none' }} target="_blank" rel="noreferrer">
          <img style={{ width: 140 }} src="../static/secret-logo.svg" />
        </a>
      </Box>
      <Box direction="row" align="baseline" gap="89px">
        <Box>
          <Title size="small" style={{ color: '#1AC7FF' }}>
            Resources links
          </Title>
          <a
            href="https://forum.scrt.network/"
            style={{ textDecoration: 'none', marginTop: '16px', color: '#fff' }}
            target="_blank"
            rel="noreferrer"
          >
            <Text>Forum</Text>
          </a>
          <a
            href="https://discord.gg/7t7PqPZFJq"
            style={{ textDecoration: 'none', marginTop: '16px', color: '#fff' }}
            target="_blank"
            rel="noreferrer"
          >
            <Text>Discord</Text>
          </a>
          <a
            href="https://github.com/enigmampc"
            style={{ textDecoration: 'none', marginTop: '16px', color: '#fff' }}
            target="_blank"
            rel="noreferrer"
          >
            <Text>Github</Text>
          </a>
          <a
            href="https://scrt.network/blog"
            style={{ textDecoration: 'none', marginTop: '16px', color: '#fff' }}
            target="_blank"
            rel="noreferrer"
          >
            <Text>Blog</Text>
          </a>
        </Box>
        <Box>
          <Title size="small" style={{ color: '#1AC7FF' }}>
            Community links
          </Title>
          <a
            href="https://puzzle.report/"
            style={{ textDecoration: 'none', marginTop: '16px', color: '#fff' }}
            target="_blank"
            rel="noreferrer"
          >
            <Text>Puzzle</Text>
          </a>
          <a
            href="http://www.secretanalytics.xyz/"
            style={{ textDecoration: 'none', marginTop: '16px', color: '#fff' }}
            target="_blank"
            rel="noreferrer"
          >
            <Text>SecretAnalytics</Text>
          </a>
        </Box>
      </Box>
    </Box>
  </Box>
);
