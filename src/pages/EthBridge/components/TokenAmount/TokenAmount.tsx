import React from 'react';
import { Text } from '../../../../components/Base';
import { BridgeControl } from '../BridgeControl/BridgeControl';

interface Props {}

export const TokenAmount: React.FC<Props> = () => {
  return (
    <BridgeControl
      title="Amount"
      gap="8px"
      centerContent={
        <Text size="large" color="NWhite">
          0.00
        </Text>
      }
      bottomContent={
        <Text size="xxsmall" color="NGray">
          100 Max Available
        </Text>
      }
    />
  );
};

TokenAmount.displayName = 'TokenAmount';
