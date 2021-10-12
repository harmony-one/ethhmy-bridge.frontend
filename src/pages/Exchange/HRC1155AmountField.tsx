import * as React from 'react';
import { Box } from 'grommet';
import { NumberInput } from 'components/Form/Fields';
import { isRequired } from 'components/Form/validations';
import { Button, Text } from 'components/Base';
import { useStores } from 'stores';
import { observer } from 'mobx-react-lite';
import { CloseIcon, SliceTooltip } from 'ui';
import { TOKEN } from '../../stores/interfaces';

export const TokensHRC1155Field = observer<{ label: string; }>(
  (params: { label: string;}) => {
    const { exchange } = useStores();

    return (
      <>
        <Text bold={true} size="large">
            <SliceTooltip value={params.label} maxLength={18} /> Token ID
        </Text>
        <Box
          direction="column"
          align="end"
          fill={true}
          margin={{ top: 'small' }}
        >
          <div style={{ width: '100%' }}>
            <NumberInput
              name={`hrc1155TokenId`}
              type="integerString"
              delimiter="."
              placeholder="0"
              style={{ width: '100%' }}
              rules={[isRequired]}
            />
          </div>
        </Box>

        <Text bold={true} size="large">
          <SliceTooltip value={params.label} maxLength={18} /> Amount
        </Text>
        <Box
          direction="column"
          align="end"
          fill={true}
          margin={{ top: 'small' }}
        >
          <div style={{ width: '100%' }}>
            <NumberInput
              name={`amount`}
              type="integerString"
              delimiter="."
              placeholder="0"
              style={{ width: '100%' }}
              rules={[isRequired]}
            />
          </div>
        </Box>
      </>
    );
  },
);
