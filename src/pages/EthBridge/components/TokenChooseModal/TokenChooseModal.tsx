import React, { useCallback, useState } from 'react';
import { Box } from 'grommet/components/Box';
import * as s from './TokenChooseModal.styl';
import { Icon, Text } from '../../../../components/Base';
import { Button } from 'grommet/components/Button';
import { useStores } from '../../../../stores';
import { observer } from 'mobx-react';
import { TextInput } from 'grommet';
import { ModalIds } from '../../../../modals';
import { TokenVertical } from './components/TokenVertical';
import { TokenHorizontal } from './components/TokenHorizontal';

interface Props {
  onClose?: () => void;
}

export const TokenChooseModal: React.FC<Props> = observer(({ onClose }) => {
  const { erc20Select, routing } = useStores();

  const [search, setSearch] = useState();

  const handleSearchChange = useCallback(event => {
    setSearch(event.target.value);
  }, []);

  const handleClickCustom = useCallback(() => {
    routing.goToModal(ModalIds.BRIDGE_CUSTOM_TOKEN);
  }, []);

  return (
    <Box
      direction="column"
      align="center"
      gap="12px"
      pad="12px"
      fill="vertical"
      margin={{ top: 'large' }}
    >
      <Box alignSelf="end">
        <Button onClick={onClose}>
          <Icon glyph="Close" color="white" />
        </Button>
      </Box>
      <Box direction="column" fill="horizontal" className={s.layer}>
        <Box
          direction="row"
          align="center"
          gap="18px"
          className={s.searchContainer}
          pad={{ horizontal: '28px', vertical: '16px' }}
          style={{ minHeight: '65px' }}
          justify="center"
        >
          <Icon glyph="SearchN" />
          <TextInput
            style={{ padding: 0, fontSize: '12px', color: '#fff' }}
            placeholder="Search Token Name"
            onChange={handleSearchChange}
          />
        </Box>
        <Box direction="column" overflow="scroll">
          {erc20Select.tokensList
            .filter(item => {
              if (search) {
                return item.symbol.toLowerCase().includes(search.toLowerCase());
              }

              return true;
            })
            .map(token => {
              return (
                <TokenHorizontal
                  className={s.borderBottom}
                  symbol={token.symbol}
                  label={token.label}
                  icon={token.image}
                  onClick={() => {
                    erc20Select.setToken(token.address);
                    onClose();
                  }}
                />
              );
            })}
        </Box>
      </Box>
      <Box
        direction="column"
        gap="8px"
        pad={{ horizontal: '28px', vertical: '20px' }}
        fill="horizontal"
        className={s.layer}
      >
        <Text color="NGray4" size="xxsmall" lh="24px">
          Popular Bridged Tokens
        </Text>
        <Box direction="row" gap="40px">
          <TokenVertical symbol="ONE" icon="/one.svg" />
          <TokenVertical symbol="ETH" icon="/eth.svg" />
          <TokenVertical symbol="BNB" icon="/binance.png" />
        </Box>
      </Box>
      <Box>
        <Button className={s.buttonCustomToken} onClick={handleClickCustom}>
          <Text color="NWhite" size="xsmall">
            Can't find your token?
          </Text>
        </Button>
      </Box>
    </Box>
  );
});

TokenChooseModal.displayName = 'TokenChooseModal';
