import React from 'react';
import { Select, Text } from '../../../../components/Base';
import { TOKEN } from '../../../../stores/interfaces';
import { Box } from 'grommet';

interface Props {
  tokenType: string;
  setToken: (value: TOKEN | 'ALL') => void;
}

const options = [
  { text: 'ALL', value: 'ALL' },
  { text: 'ERC20', value: TOKEN.ERC20 },
  { text: 'HRC20', value: TOKEN.HRC20 },
  { text: 'ERC721', value: TOKEN.ERC721 },
  { text: 'ERC1155', value: TOKEN.ERC1155 },
  { text: 'HRC721', value: TOKEN.HRC721 },
  { text: 'HRC1155', value: TOKEN.HRC1155 },
];

const styles = {
  control: {
    height: '50px',
    border: '1px solid #FFFFFF',
    borderTop: '1px solid #FFFFFF',
    borderRight: '1px solid #FFFFFF',
    borderBottom: '1px solid #FFFFFF',
    borderLeft: '1px solid #FFFFFF',
  },
};

export const FilterTokenType: React.FC<Props> = React.memo(
  ({ tokenType, setToken }) => {
    return (
      <Box direction="column" style={{ minWidth: '163px' }}>
        <Text color="NGray4" style={{ fontSize: '10px', marginBottom: '8px' }}>
          TOKEN TYPE:
        </Text>
        <Select
          size="full"
          value={tokenType}
          styles={styles}
          options={options}
          onChange={setToken}
        />
      </Box>
    );
  },
);

FilterTokenType.displayName = 'FilterTokenType';
