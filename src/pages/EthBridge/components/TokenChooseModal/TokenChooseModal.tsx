import React, { useCallback, useState } from 'react';
import { Box } from 'grommet/components/Box';
import * as s from './TokenChooseModal.styl';
import { Icon, Loader, Text } from '../../../../components/Base';
import { Button } from 'grommet/components/Button';
import { useStores } from '../../../../stores';
import { observer } from 'mobx-react';
import { TextInput } from 'grommet';
import { ModalIds } from '../../../../modals';
import { TokenVertical } from './components/TokenVertical';
import { TokenHorizontal } from './components/TokenHorizontal';
import { tokensMainnet, tokensMainnetImageMap } from '../../../Exchange/tokens';
import {
  NETWORK_BASE_TOKEN,
  NETWORK_ICON,
  NETWORK_NAME,
} from '../../../../stores/names';
import { NETWORK_TYPE, TOKEN } from '../../../../stores/interfaces';
import styled from 'styled-components';
import { LoadableContent } from '../../../../components/LoadableContent';

interface Props {
  onClose?: () => void;
}

const ScrollContainer = styled(Box)`
  &::-webkit-scrollbar {
    width: 5px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    width: 3px;
    background-color: #959595;
    border-radius: 15px;
  }
`;

export const TokenChooseModal: React.FC<Props> = observer(({ onClose }) => {
  const { erc20Select, tokens, exchange, routing } = useStores();

  const [search, setSearch] = useState();

  const handleSearchChange = useCallback(event => {
    setSearch(event.target.value);
  }, []);

  const handleClickCustom = useCallback(() => {
    routing.goToModal(ModalIds.BRIDGE_CUSTOM_TOKEN);
  }, [routing]);

  const getImage = (
    ethAddress: string,
    hrcAddress: string,
    network: NETWORK_TYPE,
  ) => {
    return (
      tokensMainnetImageMap[ethAddress.toLowerCase()] ||
      tokensMainnetImageMap[hrcAddress.toLowerCase()] ||
      NETWORK_ICON[network]
    );
  };

  return (
    <Box
      direction="column"
      align="center"
      gap="12px"
      pad="12px"
      fill="vertical"
      margin={{ top: 'large' }}
    >
      <LoadableContent loading={erc20Select.isLoading} />
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

        <ScrollContainer
          direction="column"
          overflow={{ vertical: 'scroll', horizontal: 'hidden' }}
        >
          {tokens.allData
            .filter(token => {
              if (token.network !== exchange.network) {
                return false;
              }

              if (
                token.erc20Address.toLowerCase() ===
                  '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' ||
                token.hrc20Address.toLowerCase() ===
                  '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
              ) {
                return false;
              }

              if (!search) {
                return true;
              }

              if (
                exchange.token !== TOKEN.ALL &&
                token.type !== exchange.token
              ) {
                return false;
              }

              return (
                token.erc20Address === search ||
                token.hrc20Address === search ||
                token.symbol.toLowerCase().includes(search.toLowerCase()) ||
                token.name.toLowerCase().includes(search.toLowerCase())
              );
            })
            .map(token => {
              return (
                <TokenHorizontal
                  className={s.borderBottom}
                  symbol={token.symbol}
                  label={`${token.name} - ${token.type}`}
                  icon={getImage(
                    token.erc20Address,
                    token.hrc20Address,
                    token.network,
                  )}
                  onClick={async () => {
                    exchange.setToken(token.type);

                    console.log('### start set', token);

                    await erc20Select.setToken(token.erc20Address);
                    onClose();

                    console.log('### end set');

                    // token.type
                  }}
                />
              );
            })}
        </ScrollContainer>
        {/*</Box>*/}

        {/*<Box direction="column" overflow={{ vertical: 'scroll' }}>*/}
        {/*  {erc20Select.tokensList*/}
        {/*    .filter(item => {*/}
        {/*      if (!search) {*/}
        {/*        return true;*/}
        {/*      }*/}

        {/*      return (*/}
        {/*        item.address === search ||*/}
        {/*        item.symbol.toLowerCase().includes(search.toLowerCase())*/}
        {/*      );*/}
        {/*    })*/}
        {/*    .map(token => {*/}
        {/*      return (*/}
        {/*        <TokenHorizontal*/}
        {/*          className={s.borderBottom}*/}
        {/*          symbol={token.symbol}*/}
        {/*          label={token.label}*/}
        {/*          icon={token.image}*/}
        {/*          onClick={() => {*/}
        {/*            erc20Select.setToken(token.address);*/}
        {/*            onClose();*/}
        {/*          }}*/}
        {/*        />*/}
        {/*      );*/}
        {/*    })}*/}
        {/*</Box>*/}
      </Box>
      {/* waiting for filters */}

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
          {exchange.config.tokens.includes(TOKEN.BUSD) && (
            <TokenVertical
              symbol="BUSD"
              icon="/busd.svg"
              onClick={() => {
                exchange.setToken(TOKEN.BUSD);
                routing.push(`/${exchange.token}`);
              }}
            />
          )}

          {exchange.config.tokens.includes(TOKEN.LINK) && (
            <TokenVertical
              symbol="LINK"
              icon="/link.png"
              onClick={() => {
                exchange.setToken(TOKEN.LINK);
                routing.push(`/${exchange.token}`);
              }}
            />
          )}

          {exchange.config.tokens.includes(TOKEN.ETH) && (
            <TokenVertical
              symbol={NETWORK_BASE_TOKEN[exchange.network]}
              icon={NETWORK_ICON[exchange.network]}
              onClick={() => {
                routing.push(`/${exchange.token}`);
                exchange.setToken(TOKEN.ETH);
              }}
            />
          )}

          {exchange.config.tokens.includes(TOKEN.ONE) && (
            <TokenVertical
              symbol="ONE"
              icon="/one.svg"
              onClick={() => {
                exchange.setToken(TOKEN.ONE);
                routing.push(`/${exchange.token}`);
              }}
            />
          )}
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
