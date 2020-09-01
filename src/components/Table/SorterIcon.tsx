import * as React from 'react';
import { withTheme } from 'styled-components';

interface ISorterIconProps {
  status: 'asc' | 'desc' | 'none';
  theme: any;
}

export const SorterIconFC: React.FunctionComponent<ISorterIconProps> = props => {
  const { status = 'none', theme } = props;

  switch (status) {
    case 'asc':
      return <IconAscSort color={theme.palette.Basic500} activeColor={theme.palette.Purple500} />;
    case 'desc':
      return <IconDescSort color={theme.palette.Basic500} activeColor={theme.palette.Purple500} />;

    default:
      return <IconNoSort color={theme.palette.Basic500} />;
  }
};

const IconAscSort = (props: any) => {
  const { color = '#9698A7', activeColor = '#4740A1' } = props;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 12 12">
      <g fill="none" fill-rule="nonzero">
        <path
          fill={color}
          d="M6.192 10.393L7.916 8.06a.51.51 0 0 0 .007-.551L5.63 7.5c-.39.001-.858.004-1.553.008a.51.51 0 0 0 .007.55l1.724 2.334c.054.072.126.11.2.107a.243.243 0 0 0 .184-.107z"
        />
        <path
          fill={activeColor}
          d="M6.192 1.607L7.916 3.94a.51.51 0 0 1 .007.551L5.63 4.5c-.39-.001-.858-.004-1.553-.008a.51.51 0 0 1 .007-.55l1.724-2.334c.054-.072.126-.11.2-.107.069.003.134.04.184.107z"
        />
      </g>
    </svg>
  );
};

const IconDescSort = (props: any) => {
  const { color = '#9698A7', activeColor = '#4740A1' } = props;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 12 12">
      <g fill="none" fill-rule="nonzero">
        <path
          fill={activeColor}
          d="M6.192 10.393L7.916 8.06a.51.51 0 0 0 .007-.551L5.63 7.5c-.39.001-.858.004-1.553.008a.51.51 0 0 0 .007.55l1.724 2.334c.054.072.126.11.2.107a.243.243 0 0 0 .184-.107z"
        />
        <path
          fill={color}
          d="M6.192 1.607L7.916 3.94a.51.51 0 0 1 .007.551L5.63 4.5c-.39-.001-.858-.004-1.553-.008a.51.51 0 0 1 .007-.55l1.724-2.334c.054-.072.126-.11.2-.107.069.003.134.04.184.107z"
        />
      </g>
    </svg>
  );
};

const IconNoSort = (props: any) => {
  const { color = '#9698A7' } = props;

  return (
    <svg width="16" height="16" viewBox="0 0 12 12">
      <path
        fill={color}
        fill-rule="nonzero"
        d="M4.084 8.06a.51.51 0 0 1-.007-.551L6.532 7.5c.366.001.78.004 1.39.008.089.129.101.321.04.469l-.046.082-1.724 2.333a.243.243 0 0 1-.183.107.218.218 0 0 1-.157-.06l-.044-.047L4.084 8.06zm0-4.12l1.724-2.333c.054-.072.126-.11.2-.107.069.003.134.04.184.107L7.916 3.94a.51.51 0 0 1 .007.551L5.63 4.5c-.39-.001-.858-.004-1.553-.008a.51.51 0 0 1 .007-.55z"
      />
    </svg>
  );
};

export const SorterIcon = withTheme(SorterIconFC);
