import * as React from 'react';
import { Box } from 'grommet';
import { NumberInput } from 'components/Form/Fields';
import { isRequired } from 'components/Form/validations';
import { Button, Text } from 'components/Base';
import { useStores } from 'stores';
import { observer } from 'mobx-react-lite';
import { CloseIcon, SliceTooltip } from 'ui';

export const TokensField = observer<{ label: string; maxTokens: string }>(
  (params: { label: string; maxTokens: string }) => {
    const { exchange } = useStores();

    return (
      <>
        <Text bold={true} size="large">
          <SliceTooltip value={params.label} maxLength={18} /> Token IDs
        </Text>
        <Box
          direction="column"
          align="end"
          fill={true}
          margin={{ top: 'small' }}
        >
          {Array.isArray(exchange.transaction.amount)
            ? exchange.transaction.amount.map((t, idx) => (
                <Box
                  direction="row"
                  justify="between"
                  key={String(idx)}
                  style={{ width: '100%' }}
                  fill={true}
                >
                  <div style={{ width: '100%' }}>
                    <NumberInput
                      name={`amount[${idx}]`}
                      type="integer"
                      precision="6"
                      delimiter="."
                      placeholder="0"
                      style={{ width: '100%' }}
                      rules={[isRequired]}
                    />
                  </div>
                  {!!idx ? (
                    <Box
                      margin={{ horizontal: 'medium', top: '15px' }}
                      align="start"
                      onClick={() => {
                        if (
                          Array.isArray(exchange.transaction.amount) &&
                          exchange.transaction.amount.length > 1
                        ) {
                          exchange.transaction.amount = exchange.transaction.amount.filter(
                            (a, id) => id !== idx,
                          );
                        }
                      }}
                    >
                      <CloseIcon hover={true} />
                    </Box>
                  ) : null}
                </Box>
              ))
            : null}
          <Button
            bgColor="#00ADE8"
            style={{ width: 180, top: 10 }}
            onClick={() => {
              if (
                Array.isArray(exchange.transaction.amount) &&
                exchange.transaction.amount.length < Number(params.maxTokens)
              ) {
                exchange.transaction.amount.push('0');
              }
            }}
          >
            Add Token Id
          </Button>
        </Box>
      </>
    );
  },
);
