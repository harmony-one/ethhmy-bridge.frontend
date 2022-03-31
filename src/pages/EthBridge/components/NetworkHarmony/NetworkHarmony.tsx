import React from 'react';
import { BridgeControl } from '../BridgeControl/BridgeControl';
import { NetworkIcon } from '../NetworkIcon/NetworkIcon';
import { NETWORK_TYPE } from '../../../../stores/interfaces';
import { Text } from '../../../../components/Base';
import { networkNameMap } from '../../constants';

interface Props {
  title: string;
}

export const NetworkHarmony: React.FC<Props> = ({ title }) => {
  return (
    <BridgeControl
      title={title}
      centerContent={<NetworkIcon network={NETWORK_TYPE.HARMONY} />}
      bottomContent={
        <Text size="small" uppercase>
          {networkNameMap[NETWORK_TYPE.HARMONY]}
        </Text>
      }
    />
  );
};

NetworkHarmony.displayName = 'NetworkHarmony';
