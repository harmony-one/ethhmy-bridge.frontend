import React from 'react';
import { Box } from 'grommet/components/Box';
import * as s from './TokenChooseModal.styl';
import { Icon, Text } from '../../../../components/Base';
import { Button } from 'grommet/components/Button';

interface TokenHorizontalProps {
  symbol: string;
  icon: string;
  label: string;
}

const TokenHorizontal: React.FC<TokenHorizontalProps> = ({
  symbol,
  label,
  icon,
}) => {
  return (
    <Box
      direction="row"
      align="center"
      gap="18px"
      pad={{ horizontal: '28px', vertical: '16px' }}
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

export const TokenChooseModal: React.FC<Props> = ({ onClose }) => {
  return (
    <Box direction="column" align="center" width="408px" gap="12px">
      <Box alignSelf="end">
        <Button onClick={onClose}>
          <Icon glyph="Close" color="white" />
        </Button>
      </Box>
      <Box fill="horizontal" className={s.layer}>
        <TokenHorizontal
          symbol="USDC"
          label="USD Coin"
          icon="https://etherscan.io/token/images/centre-usdc_28.png"
        />
        <TokenHorizontal
          symbol="LINK"
          label="Chainlink"
          icon="https://etherscan.io/token/images/chainlink_28_2.png"
        />
        <TokenHorizontal
          symbol="USDT"
          label="Tether"
          icon="https://etherscan.io/token/images/tether_32.png"
        />
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
      <Box>help</Box>
    </Box>
  );
};

TokenChooseModal.displayName = 'TokenChooseModal';
