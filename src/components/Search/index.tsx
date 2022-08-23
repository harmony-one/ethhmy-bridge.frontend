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
  background: ${props => props.theme.styled.input.bgColor};
  padding: 0 0 0 16px;
  border-radius: 15px;
  color: ${props => props.theme.styled.input.textColor};
  border: 1px solid ${props => props.theme.styled.input.border};
  height: 50px;
  font-size: 16px;
  ::placeholder {
    color: ${baseTheme.palette.Basic400};
  }

  input {
    color: ${props => props.theme.styled.input.textColor};
  }
`;

function SearchIcon() {
  return (
    <Box>
      <Icon glyph="SearchN" size="20px" style={{ marginRight: 5 }} />
    </Box>
  );
}

function CleanIcon({ onClick }: { onClick: () => void }) {
  return (
    <Icon
      onClick={onClick}
      glyph="Close"
      size="20px"
      style={{ marginRight: 10, marginLeft: 10 }}
    />
  );
}
