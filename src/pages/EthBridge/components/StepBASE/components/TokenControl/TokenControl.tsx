import React, { useCallback, useMemo } from 'react';
import { Icon, Text } from '../../../../../../components/Base';
import { BridgeControl } from '../../../BridgeControl/BridgeControl';
import { Button } from 'grommet/components/Button';
import { Box } from 'grommet';
import { useStores } from '../../../../../../stores';
import { ModalIds } from '../../../../../../modals';
import { observer } from 'mobx-react';
import { TOKEN } from '../../../../../../stores/interfaces';
import { isMultiNFT, isNFT } from '../../../../../../stores/Exchange/helpers';
import { tokenConfig } from '../../../../constants';

interface Props {}

const selectAllow = [TOKEN.ERC20, TOKEN.HRC20, TOKEN.ALL];

const customTokens = [TOKEN.ERC721, TOKEN.HRC721, TOKEN.HRC1155, TOKEN.ERC1155];

export const TokenControl: React.FC<Props> = observer(() => {
  const { routing, exchange, bridgeFormStore } = useStores();

  const isSelectable = [...selectAllow, ...customTokens].includes(
    exchange.token,
  );
  const handleChangeToken = useCallback(() => {
    if (selectAllow.includes(exchange.token)) {
      routing.goToModal(ModalIds.BRIDGE_TOKEN_CHOOSE);
      return;
    } else if (customTokens.includes(exchange.token)) {
      routing.goToModal(ModalIds.BRIDGE_CUSTOM_TOKEN);
      return;
    }

    console.error('### unhandled token type', exchange.token);
    return;
  }, [routing, exchange, exchange.token]);

  const centerContent = (
    <Box direction="row" gap="8px">
      <Text size="large">{bridgeFormStore.tokenConfig.name}</Text>
      {isSelectable && <Icon size="10px" glyph="ArrowDownFilled" />}
    </Box>
  );
  return (
    <BridgeControl
      title="Choose Token"
      gap="8px"
      centerContent={
        <Box height="32px" justify="center">
          {isSelectable ? (
            <Button onClick={handleChangeToken}>{centerContent}</Button>
          ) : (
            centerContent
          )}
        </Box>
      }
      bottomContent={
        <Text size="xxsmall" color="NGray">
          {bridgeFormStore.tokenConfig.label}
        </Text>
      }
    />
  );
});

TokenControl.displayName = 'TokenControl';
