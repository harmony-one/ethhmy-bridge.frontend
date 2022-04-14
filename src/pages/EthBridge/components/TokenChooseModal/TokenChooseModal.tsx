import React, { useCallback, useState } from 'react';
import { Box } from 'grommet/components/Box';
import * as s from './TokenChooseModal.styl';
import { Icon, Text } from '../../../../components/Base';
import { Button } from 'grommet/components/Button';
import { TOKEN } from '../../../../stores/interfaces';
import { useStores } from '../../../../stores';
import { observer } from 'mobx-react';
import { TextInput } from 'grommet';
import { ModalIds } from '../../../../modals';

interface TokenHorizontalProps {
  className?: string;
  symbol: string;
  icon: string;
  label: string;
  onClick: () => void;
}

const TokenHorizontal: React.FC<TokenHorizontalProps> = ({
  className,
  symbol,
  label,
  icon,
  onClick,
}) => {
  return (
    <Box
      direction="row"
      className={className}
      align="center"
      gap="18px"
      onClick={onClick}
      pad={{ horizontal: '28px', vertical: '16px' }}
      style={{ minHeight: '58px' }}
    >
      <Box>
        <img src={icon} width="16px" height="16px" />
      </Box>
      <Box>
        <Text color="NWhite" size="xsmall">
          {symbol}
        </Text>
        <Text color="NGray4" size="xxsmall">
          {label}
        </Text>
      </Box>
      <Box margin={{ left: 'auto' }}>
        <Text color="NWhite" size="xsmall" lh="19px">
          0
        </Text>
      </Box>
    </Box>
  );
};

interface TokenVerticalProps {
  icon: string;
  symbol: string;
}
const TokenVertical: React.FC<TokenVerticalProps> = ({ icon, symbol }) => {
  return (
    <Box direction="column" align="center" gap="4px">
      <Box>
        <img width="20px" height="20px" src={icon} />
      </Box>
      <Box>
        <Text color="NWhite" size="xxxsmall" lh="19px">
          {symbol}
        </Text>
      </Box>
    </Box>
  );
};

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
      width="408px"
      gap="12px"
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
