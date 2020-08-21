import * as React from 'react';
import { Box } from 'grommet';
import { withTheme } from 'styled-components';
import { IStyledProps } from 'themes';
// import background from '../../assets/images/header.png';
// import background from '../../../assets/images/header.png';
import { Title } from 'components/Base';
import { Spinner } from 'ui/Spinner';
import { CloseIcon } from 'ui/Icons';

interface IHederProps {
  onClose: () => any;
  title: string;
  pending: boolean;
}

export const Header = withTheme(
  ({ pending, title, onClose, theme }: IHederProps & IStyledProps) => (
    <Box
      direction="row"
      justify="between"
      align="center"
      pad={{ horizontal: 'xlarge' }}
      style={{ background: '#1c2a5e', height: 80 }}
    >
      <Box
        direction="row"
        style={{ alignItems: pending ? 'center' : 'baseline' }}
      >
        <Title
          size="large"
          color="StandardWhite"
          style={{ marginRight: '16px', maxWidth: '500px' }}
        >
          {title}
        </Title>
        {pending && <Spinner style={{ width: 20, height: 20 }} />}
      </Box>
      {/*<CloseIcon hover={true} fill="white" onClick={onClose} />*/}
    </Box>
  ),
);
