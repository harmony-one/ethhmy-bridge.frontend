import * as React from 'react';
import { Box } from 'grommet';
import { Icon, TextInput } from 'components/Base';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { baseTheme } from '../../themes';

export const SearchInput = observer(
  (params: { value: string; onChange: (value: string) => void }) => {
    return (
      <StyledInput
        style={{
          background: 'white',
          flex: 1,
          padding: '0 0 0 16px',
          height: 48,
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Enter') params.onChange(params.value);
        }}
        renderLeft={<SearchIcon />}
        renderRight={
          params.value && <CleanIcon onClick={() => params.onChange('')} />
        }
        placeholder="Search by asset details"
        value={params.value}
        onChange={value => params.onChange(value)}
        {...({} as any)} // dirty hack for typechecking onKeyDown
      />
    );
  },
);

const StyledInput = styled(TextInput)`
  padding: 0px;
  color: ${baseTheme.palette.BlackTxt};
  font-size: 16px;
  ::placeholder {
    color: ${baseTheme.palette.Basic400};
  }
`;

function SearchIcon() {
  return (
    <Box>
      <Icon
        glyph="Search"
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
