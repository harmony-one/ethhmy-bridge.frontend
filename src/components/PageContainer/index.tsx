import * as React from 'react';
import { Box, BoxProps } from 'grommet';
import { IStyledChildrenProps } from 'interfaces';
import { withTheme } from 'styled-components';

export const PageContainer: React.FC<IStyledChildrenProps<BoxProps>> =
  withTheme(({ children, theme, ...props }: IStyledChildrenProps<BoxProps>) => {
    //TODO: Придумать вариант, избавляющий от внутреннего div
    return <Box
      style={{
        height: '100%',
      }}
      {...props}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          // backgroundColor: theme.palette.Basic100,
          justifyContent: 'normal',
          padding: '0px 10px',
        }}
      >
        {children}
      </div>
    </Box>
  });
