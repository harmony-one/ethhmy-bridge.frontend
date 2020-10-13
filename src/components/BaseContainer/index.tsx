import * as React from 'react';
import { Box, BoxProps } from 'grommet';
import { Head } from 'components';
import { withTheme } from 'styled-components';
import { IStyledChildrenProps } from 'interfaces';
// import * as styles from './styles.styl';
import { Disclaimer } from '../DisclaimerWarning';

export const BaseContainer: React.FC<IStyledChildrenProps<
  BoxProps
>> = withTheme(
  ({ theme, children, ...props }: IStyledChildrenProps<BoxProps>) => {
    const { palette, container } = theme;
    const { minWidth, maxWidth } = container;
    return (
      <>
        {/*<div className={styles.backgroundImage} />*/}
        {/*<div className={styles.blur} />*/}
        <div
          style={{
            minHeight: '100%',
            zIndex: 3,
            position: 'absolute',
            top: 0,
            width: '100vw',
            backgroundColor: '#F2F3F8', // palette.Basic100,
            // backgroundImage: "url('logo_background.svg')",
            backgroundImage: "url('/harmony_logo_background.svg')",
            backgroundPosition: '0 100%',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <Head />
          <Box
            style={{
              minWidth,
              maxWidth,
              margin: '120px auto 20px',
            }}
            {...props}
          >
            {process.env.NODE_ENV === 'testnet' ? <Disclaimer /> : null}
            {children}
          </Box>
        </div>
      </>
    );
  },
);
