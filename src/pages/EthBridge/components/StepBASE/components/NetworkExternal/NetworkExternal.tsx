import React from 'react';
import { Text, Icon } from '../../../../../../components/Base';
import { BridgeControl } from '../../../BridgeControl/BridgeControl';
import { networkNameMap } from '../../../../constants';
import { NetworkIcon } from '../../../NetworkIcon/NetworkIcon';
import { Menu, Box } from 'grommet';
import { useStores } from '../../../../../../stores';
import {
  EXCHANGE_MODE,
  NETWORK_TYPE,
} from '../../../../../../stores/interfaces';
import { observer } from 'mobx-react';

interface NetworkMenuItemProps {
  network: string;
  token: string;
  icon: React.ReactNode;
}

const NetworkMenuItem: React.FC<NetworkMenuItemProps> = ({
  network,
  token,
  icon,
}) => {
  return (
    <Box
      direction="row"
      justify="center"
      align="center"
      gap="8px"
      fill="horizontal"
    >
      <Box>{icon}</Box>
      <Box>
        <Text color="NWhite">{network}</Text>
      </Box>
      <Box alignSelf="end" margin={{ left: 'auto' }}>
        <Text size="xxsmall" color="NGray">
          {token}
        </Text>
      </Box>
    </Box>
  );
};

const NetworkMenu = observer(() => {
  const { exchange } = useStores();

  const label = networkNameMap[exchange.network];

  return (
    <Menu
      style={{ padding: 0 }}
      alignSelf="center"
      dropProps={{
        align: { top: 'bottom' },
        background: '#000000',
        round: { size: '10px' },
        elevation: 'none',
        margin: { top: '12px' },
      }}
      justifyContent="center"
      label={label}
      items={[
        {
          label: (
            <NetworkMenuItem
              network={networkNameMap[NETWORK_TYPE.BINANCE]}
              icon={<Icon glyph="Binance" />}
              token={'BNB'}
            />
          ),
          onClick: () => {
            exchange.setNetwork(NETWORK_TYPE.BINANCE);
          },
        },
        {
          label: (
            <NetworkMenuItem
              network={networkNameMap[NETWORK_TYPE.ETHEREUM]}
              icon={<Icon glyph="Ethereum" />}
              token={'ETH'}
            />
          ),
          onClick: () => {
            exchange.setNetwork(NETWORK_TYPE.ETHEREUM);
          },
        },
      ]}
    >
      <Box gap="8px" direction="row">
        <Text color="NWhite" size="small" uppercase>
          {label}
        </Text>
        <Icon size="10" glyph="ArrowDownFilled" />
      </Box>
    </Menu>
  );
});

interface Props {
  title: string;
}

export const NetworkExternal: React.FC<Props> = observer(({ title }) => {
  const { exchange } = useStores();
  return (
    <BridgeControl
      title={title}
      centerContent={<NetworkIcon network={exchange.network} />}
      bottomContent={<NetworkMenu />}
    />
  );
});

NetworkExternal.displayName = 'NetworkExternal';
