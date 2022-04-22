import * as React from 'react';
import { Box } from 'grommet';
import { Icon, TextInput } from 'components/Base';
import { observer } from 'mobx-react-lite';
import styled, { css } from 'styled-components';
import { baseTheme } from '../../themes';

export const SearchInput = observer(
  (params: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
  }) => {
    return (
      <StyledInput
        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Enter') params.onChange(params.value);
        }}
        renderLeft={<SearchIcon />}
        renderRight={
          params.value && <CleanIcon onClick={() => params.onChange('')} />
        }
        placeholder={params.placeholder || ''}
        value={params.value}
        onChange={value => params.onChange(value)}
        {...({} as any)} // dirty hack for typechecking onKeyDown
      />
    );
  },
);

const Custom = ({ className, ...restProps }) => {
  return <TextInput wrapperProps={{ className }} {...restProps} />;
};

const StyledInput = styled(Custom)`
  background: ${props => props.theme.palette.NBlack2};
  padding: 0 0 0 16px;
  border-radius: 15px;
  color: ${props => props.theme.palette.NWhite};
  border: 1px solid ${props => props.theme.palette.NWhite};
  height: 50px;
  font-size: 16px;
  ::placeholder {
    color: ${baseTheme.palette.Basic400};
  }
`;

function SearchIcon() {
  return (
    <Box>
      <Icon
        glyph="SearchN"
        size="20px"
        color="#A4A7AB"
        style={{ marginRight: 5 }}
      />
    </Box>
  );
}

function CleanIcon({ onClick }: { onClick: () => void }) {
  return (
    <Icon
      onClick={onClick}
      glyph="Close"
      size="20px"
      color="#D1D3D5"
      style={{ marginRight: 10, marginLeft: 10 }}
    />
  );
}
