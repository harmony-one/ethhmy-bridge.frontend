import React, { useCallback } from 'react';
import { Text, Icon } from '../../../../components/Base';
import { BridgeControl } from '../BridgeControl/BridgeControl';
import { Button } from 'grommet/components/Button';
import { Box } from 'grommet';
import { useStores } from '../../../../stores';
import { ModalIds, ModalRegister } from '../../../../modals';
import { TokenChooseModal } from '../TokenChooseModal/TokenChooseModal';

interface Props {}

export const TokenControl: React.FC<Props> = () => {
  const { routing } = useStores();

  const handleChangeToken = useCallback(() => {
    routing.goToModal(ModalIds.BRIDGE_TOKEN_CHOOSE, {
      modal: {
        id: ModalIds.BRIDGE_TOKEN_CHOOSE,
      },
    });
  }, [routing]);

  return (
    <BridgeControl
      title="Choose Token"
      gap="8px"
      centerContent={
        <Button onClick={handleChangeToken}>
          <Box direction="row" gap="8px">
            <Text size="large" color="NWhite">
              BNB
            </Text>
            <Icon size="10px" glyph="ArrowDownFilled" />
          </Box>
          <ModalRegister
            modalId={ModalIds.BRIDGE_TOKEN_CHOOSE}
            params={{ layerProps: {} }}
          >
            <TokenChooseModal />
          </ModalRegister>
        </Button>
      }
      bottomContent={
        <Text size="xxsmall" color="NGray">
          Binance Coin
        </Text>
      }
    />
  );
};

TokenControl.displayName = 'TokenControl';
