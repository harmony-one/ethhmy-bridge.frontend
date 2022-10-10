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
import {
  NETWORK_BASE_TOKEN,
  NETWORK_ICON,
} from '../../../../../../stores/names';
import { TokenVertical } from '../../../TokenChooseModal/components/TokenVertical';
import { observer } from 'mobx-react';

interface Props {}

export const TokenSettings: React.FC<Props> = observer(() => {
  const { routing, exchange, bridgeFormStore } = useStores();

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
    <Box direction="row" gap="28px">
      <TokenVertical
        active={bridgeFormStore.data.token === TOKEN.BUSD}
        symbol="BUSD"
        icon="/busd.svg"
        onClick={() => {
          bridgeFormStore.setToken(TOKEN.BUSD);
          // routing.push(`/${exchange.token}`);
        }}
      />
      {exchange.config.tokens.includes(TOKEN.LINK) && (
        <TokenVertical
          active={bridgeFormStore.data.token === TOKEN.LINK}
          symbol="LINK"
          icon="/link.png"
          onClick={() => {
            bridgeFormStore.setToken(TOKEN.LINK);
            // routing.push(`/${exchange.token}`);
          }}
        />
      )}
      {exchange.config.tokens.includes(TOKEN.ETH) && (
        <TokenVertical
          active={bridgeFormStore.data.token === TOKEN.ETH}
          symbol={NETWORK_BASE_TOKEN[exchange.network]}
          icon={NETWORK_ICON[exchange.network]}
          onClick={() => {
            bridgeFormStore.setToken(TOKEN.ETH);
            // routing.push(`/${exchange.token}`);
          }}
        />
      )}
      {exchange.config.tokens.includes(TOKEN.ONE) && (
        <TokenVertical
          active={bridgeFormStore.data.token === TOKEN.ONE}
          symbol="ONE"
          icon="/one.svg"
          onClick={() => {
            bridgeFormStore.setToken(TOKEN.ONE);
            // routing.push(`/${exchange.token}`);
          }}
        />
      )}
    </Box>
    // <Button className={s.root} onClick={handleSubmit}>
    //
    //
    //   <Box direction="row" justify="center" align="center" gap="8px" pad="8px">
    //     <Text lh="20px" size="small" color="NGray">
    //       Token Type
    //     </Text>
    //     <Text lh="20px" size="small">
    //       {getTokenTypeName()}
    //     </Text>
    //     {/*<Icon className={s.icon} size="10px" glyph="Settings" />*/}
    //     <Filter size="16px" className={s.icon} />
    //   </Box>
    //   <ModalRegister modalId={ModalIds.BRIDGE_TOKEN_SETTINGS}>
    //     <TokenSettingsModal />
    //   </ModalRegister>
    // </Button>
  );
});

TokenSettings.displayName = 'TokenSettings';
