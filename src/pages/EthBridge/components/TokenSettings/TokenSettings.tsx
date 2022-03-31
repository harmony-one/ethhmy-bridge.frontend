import React, { useCallback } from 'react';
import { Box } from 'grommet';
import { Icon, Text } from '../../../../components/Base';
import { Button } from 'grommet/components/Button';
import * as s from './TokenSettings.styl';
import { ModalRegister } from '../../../../modals/ModalRegister';
import { ModalIds } from '../../../../modals/types';
import { useStores } from '../../../../stores';
import { TokenSettingsModal } from '../TokenSettingsModal/TokenSettingsModal';

interface Props {}

export const TokenSettings: React.FC<Props> = () => {
  const { routing } = useStores();

  const handleSubmit = useCallback(() => {
    routing.goToModal(ModalIds.BRIDGE_TOKEN_SETTINGS, {
      modal: {
        id: ModalIds.BRIDGE_TOKEN_SETTINGS,
      },
    });
  }, [routing]);

  return (
    <Button className={s.root} onClick={handleSubmit}>
      <Box direction="row" justify="center" align="center" gap="8px">
        <Text lh="20px" size="xxsmall" color="NGray">
          Token Type
        </Text>
        <Text lh="20px" size="xxsmall" color="NWhite">
          BOTH
        </Text>
        <Icon className={s.icon} size="10px" glyph="Settings" />
      </Box>
      <ModalRegister
        modalId={ModalIds.BRIDGE_TOKEN_SETTINGS}
        params={{
          layerProps: {},
        }}
      >
        <TokenSettingsModal />
      </ModalRegister>
    </Button>
  );
};

TokenSettings.displayName = 'TokenSettings';
