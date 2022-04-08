import React, { useCallback, useEffect, useMemo } from 'react';
import { Text, Icon } from '../../../../components/Base';
import { BridgeControl } from '../BridgeControl/BridgeControl';
import { Button } from 'grommet/components/Button';
import { Box } from 'grommet';
import { useStores } from '../../../../stores';
import { ModalIds, ModalRegister } from '../../../../modals';
import { TokenChooseModal } from '../TokenChooseModal/TokenChooseModal';
import { observer } from 'mobx-react';

interface Props {}

export const TokenControl: React.FC<Props> = observer(() => {
  const { routing, exchange, erc20Select } = useStores();

  const handleChangeToken = useCallback(() => {
    routing.goToModal(ModalIds.BRIDGE_TOKEN_CHOOSE, {
      modal: {
        id: ModalIds.BRIDGE_TOKEN_CHOOSE,
      },
    });
  }, [routing]);

  const selectedToken2 = exchange.tokenInfo;

  useEffect(() => {
    // const token = erc20Select.tokensList[0];
    // if (!erc20Select.tokenAddress) {
    //   setTimeout(() => {
    //     erc20Select.setToken(token.address);
    //   }, 500);
    // }
  }, [erc20Select.tokenAddress]);

  console.log('### erc20Select.error', erc20Select.error);

  return (
    <BridgeControl
      title="Choose Token"
      gap="8px"
      centerContent={
        <Button onClick={handleChangeToken}>
          <Box direction="row" gap="8px">
            <Text size="large" color="NWhite">
              {selectedToken2 && selectedToken2.symbol}
            </Text>
            <Icon size="10px" glyph="ArrowDownFilled" />
          </Box>
          <ModalRegister
            modalId={ModalIds.BRIDGE_TOKEN_CHOOSE}
            params={{ layerProps: { full: 'vertical' } }}
          >
            <TokenChooseModal />
          </ModalRegister>
        </Button>
      }
      bottomContent={
        <Text size="xxsmall" color="NGray">
          {selectedToken2 && selectedToken2.label}
        </Text>
      }
    />
  );
});

TokenControl.displayName = 'TokenControl';
