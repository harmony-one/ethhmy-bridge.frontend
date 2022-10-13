import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { tokensMainnetImageMap } from '../../../Exchange/tokens';
import { NETWORK_BASE_TOKEN, NETWORK_ICON } from '../../../../stores/names';
import { ITokenInfo, NETWORK_TYPE, TOKEN } from '../../../../stores/interfaces';
import styled from 'styled-components';
import { LoadableContent } from '../../../../components/LoadableContent';
import { buildTokenId } from '../../../../utils/token';
import { formatWithTwoDecimals } from '../../../../utils';

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

const StyledTextInput = styled(TextInput)`
  padding: 0;
  font-size: 12px;
  color: ${props => props.theme.styled.input.textColor};
  border: none;
`;

const ModalContent = styled(Box)`
  max-height: 480px;
  border: 1px solid ${props => props.theme.modal.borderColor};
  background-color: ${props => props.theme.modal.bgColor};
  border-radius: 10px;
  min-width: 408px;
`;

export const TokenChooseModal: React.FC<Props> = observer(({ onClose }) => {
  const { erc20Select, tokens, exchange, routing, userMetamask } = useStores();

  const [search, setSearch] = useState();

  const handleSearchChange = useCallback(event => {
    setSearch(event.target.value);
  }, []);

  useEffect(() => {
    if (tokens.allData.length) {
      userMetamask.loadTokenListBalance(tokens.allData);
    }
  }, [tokens.allData, userMetamask]);

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

  const filterExtraToken = (token: ITokenInfo) => {
    // if (
    //   token.symbol.toLowerCase() === TOKEN.BUSD ||
    //   token.symbol.toLowerCase() === TOKEN.LINK
    // ) {
    //   return false;
    // }

    return true;
  };

  const tokenlist = useMemo(() => {
    console.log('TOKENS', tokens);

    return tokens.allData
      .filter(filterExtraToken)
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

        if (exchange.token !== TOKEN.ALL && exchange.token !== token.type) {
          return false;
        }

        return (
          token.erc20Address === search ||
          token.hrc20Address === search ||
          token.symbol.toLowerCase().includes(search.toLowerCase()) ||
          token.name.toLowerCase().includes(search.toLowerCase())
        );
      })
      .sort((a, b) => {
        // sort by balance
        const tokenIdA = buildTokenId(a);
        const balanceA = userMetamask.balances[tokenIdA] || 0;
        const tokenIdB = buildTokenId(b);
        const balanceB = userMetamask.balances[tokenIdB] || 0;

        return Number(balanceB) - Number(balanceA);
      });
  }, [
    exchange.network,
    exchange.token,
    search,
    tokens.allData,
    userMetamask.balances,
  ]);

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
          <Icon glyph="Close" />
        </Button>
      </Box>
      <ModalContent direction="column" fill="horizontal">
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
          <StyledTextInput
            placeholder="Search Token Name"
            onChange={handleSearchChange}
          />
        </Box>

        <ScrollContainer
          direction="column"
          overflow={{ vertical: 'scroll', horizontal: 'hidden' }}
        >
          {tokenlist.map(token => {
            const tokenId = buildTokenId(token);
            const balance = userMetamask.balances[tokenId] || 0;
            return (
              <TokenHorizontal
                key={tokenId}
                className={s.borderBottom}
                symbol={token.symbol}
                label={`${token.name} - ${token.type}`}
                balance={formatWithTwoDecimals(balance)}
                icon={getImage(
                  token.erc20Address,
                  token.hrc20Address,
                  token.network,
                )}
                onClick={async () => {
                  exchange.setToken(token.type);

                  await erc20Select.setToken(token.erc20Address);
                  onClose();
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
      </ModalContent>
      {/* waiting for filters */}

      <ModalContent
        direction="column"
        gap="8px"
        pad={{ horizontal: '28px', vertical: '20px' }}
        fill="horizontal"
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
      </ModalContent>
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
