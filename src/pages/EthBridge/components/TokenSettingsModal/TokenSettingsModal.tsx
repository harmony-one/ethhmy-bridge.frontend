import React from 'react';
import { Icon, Text } from '../../../../components/Base';
import { Box } from 'grommet/components/Box';
import { Button } from 'grommet/components/Button';
import * as s from './TokenSettingsModal.styl';
import cn from 'classnames';

interface OptionProps {
  checked?: boolean;
}

const Option: React.FC<OptionProps> = ({ checked = false }) => {
  const buttonClasses = cn(s.optionButton, {
    [s.checked]: checked,
  });
  return (
    <Button fill="horizontal" className={buttonClasses}>
      <Box direction="row" gap="16px" align="center" pad="20px">
        <Box gap="8px">
          <Icon glyph="Harmony" />
          <Icon glyph="Ethereum" />
        </Box>
        <Box direction="column" align="start">
          <Text color="Gray" size="xxsmall" lh="18px">
            ERC20 & HRC20
          </Text>
          <Text color="NWhite" size="xsmall" lh="18px">
            Both Harmony & Ethereum
          </Text>
          <Text color="NWhite" size="xxsmall" lh="18px">
            Tokens
          </Text>
        </Box>
        {checked && (
          <Box margin={{ left: 'auto' }}>
            <Icon color="#01E8A2" glyph="Check" />
          </Box>
        )}
      </Box>
    </Button>
  );
};

interface Props {
  onClose?: () => void;
}

export const TokenSettingsModal: React.FC<Props> = ({ onClose }) => {
  return (
    <Box
      className={s.layer}
      direction="column"
      align="center"
      width="408px"
      pad="28px"
      gap="20px"
    >
      <Box>
        <Text color="NGray4" size="medium">
          Displaying Tokens
        </Text>
      </Box>
      <Option checked />
      <Option />
      <Option />

      <Button onClick={onClose} fill="horizontal" label="Close" />
    </Box>
  );
};

TokenSettingsModal.displayName = 'TokenSettingsModal';
