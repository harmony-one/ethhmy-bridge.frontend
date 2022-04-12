import React, { useEffect, useState } from 'react';
import { Text } from '../../../../../../components/Base';
import { BridgeControl } from '../../../BridgeControl/BridgeControl';
import { isRequired, NumberInput } from '../../../../../../components/Form';
import { formatWithSixDecimals, moreThanZero } from '../../../../../../utils';
import { useStores } from '../../../../../../stores';
import * as s from './TokenAmount.styl';
import cn from 'classnames';
import { observer } from 'mobx-react';
import { TOKEN } from '../../../../../../stores/interfaces';

interface Props {}

export const TokenAmount: React.FC<Props> = observer(() => {
  const { exchange } = useStores();

  let maxAmount = '';
  if (
    ![TOKEN.ERC721, TOKEN.HRC721, TOKEN.ERC1155, TOKEN.HRC1155].includes(
      exchange.token,
    )
  ) {
    maxAmount = formatWithSixDecimals(exchange.tokenInfo.maxAmount);
  } else if ([TOKEN.ERC1155, TOKEN.HRC1155].includes(exchange.token)) {
    maxAmount = exchange.tokenInfo.maxAmount;
  }

  return (
    <BridgeControl
      title="Amount"
      gap="8px"
      centerContent={
        <NumberInput
          align="center"
          wrapperProps={{ className: s.wrapperClassName }}
          margin="none"
          name="amount"
          type="decimal"
          precision="0"
          bgColor="transparent"
          border="none"
          delimiter="."
          placeholder="0"
          style={{ width: '100%', textAlign: 'center' }}
          rules={[
            isRequired,
            moreThanZero,
            (_, value, callback) => {
              const errors = [];

              // if (value && Number(value) > Number(this.tokenInfo.maxAmount)) {
              //   const defaultMsg = `Exceeded the maximum amount`;
              //   errors.push(defaultMsg);
              // }

              callback(errors);
            },
          ]}
        />
      }
      bottomContent={
        <Text size="xxsmall" color="NGray">
          {maxAmount} Max Available
        </Text>
      }
    />
  );
});

TokenAmount.displayName = 'TokenAmount';
