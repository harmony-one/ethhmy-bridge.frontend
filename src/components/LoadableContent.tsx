import React from 'react';
import styled from 'styled-components';
import { Box, Spinner } from 'grommet';
import { Text } from 'components/Base';

interface Props {
  loading: boolean;
}

const StyledBox = styled(Box)<Props>`
  display: ${props => (props.loading ? 'block' : 'none')};
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.5);
`;

export const LoadableContent: React.FC<Props> = ({ loading }) => {
  return (
    <StyledBox loading={loading}>
      <Box justify="center" fill align="center">
        <Spinner size="medium" />
      </Box>
    </StyledBox>
  );
};

LoadableContent.displayName = 'LoadableContent';
