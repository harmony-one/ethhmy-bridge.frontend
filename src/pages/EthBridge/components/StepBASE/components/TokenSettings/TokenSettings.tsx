import React, { useCallback } from 'react';
import { Box } from 'grommet';
import { FormSearch, MoreVertical, Filter } from 'grommet-icons';
import { Icon, Text } from '../../../../../../components/Base';
import { Button } from 'grommet/components/Button';
import * as s from './TokenSettings.styl';
import { ModalRegister } from '../../../../../../modals';
import { ModalIds } from '../../../../../../modals';
import { useStores } from '../../../../../../stores';
import { TokenSettingsModal } from '../../../TokenSettingsModal/TokenSettingsModal';
import { NETWORK_TYPE, TOKEN } from '../../../../../../stores/interfaces';
import { NETWORK_BASE_TOKEN } from '../../../../../../stores/names';

interface Props {}

export const TokenSettings: React.FC<Props> = () => {
  const { routing, exchange } = useStores();

  const handleSubmit = useCallback(() => {
    routing.goToModal(ModalIds.BRIDGE_TOKEN_SETTINGS);
  }, [routing]);

  const getTokenTypeName = () => {
    if (!exchange || !exchange.token) {
      return '';
    }

    if (exchange.token === TOKEN.ERC20) {
      return exchange.network === NETWORK_TYPE.ETHEREUM ? 'ERC20' : 'BEP20';
    }

    if (exchange.token === TOKEN.ETH) {
      return NETWORK_BASE_TOKEN[exchange.network];
    }

    return exchange.token.toUpperCase();
  };

  return (
    <Button className={s.root} onClick={handleSubmit}>
      <Box direction="row" justify="center" align="center" gap="8px" pad="8px">
        <Text lh="20px" size="small" color="NGray">
          Token Type
        </Text>
        <Text lh="20px" size="small" color="NWhite">
          {getTokenTypeName()}
        </Text>
        {/*<Icon className={s.icon} size="10px" glyph="Settings" />*/}
        <Filter size="16px" className={s.icon} />
      </Box>
      <ModalRegister modalId={ModalIds.BRIDGE_TOKEN_SETTINGS}>
        <TokenSettingsModal />
      </ModalRegister>
    </Button>
  );
};

TokenSettings.displayName = 'TokenSettings';
