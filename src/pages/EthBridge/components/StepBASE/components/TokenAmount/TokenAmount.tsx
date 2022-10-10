import React, { useContext } from 'react';
import { Text } from '../../../../../../components/Base';
import { BridgeControl } from '../../../BridgeControl/BridgeControl';
import { isRequired, NumberInput } from '../../../../../../components/Form';
import { formatWithSixDecimals, moreThanZero } from '../../../../../../utils';
import { useStores } from '../../../../../../stores';
import * as s from './TokenAmount.styl';
import { observer } from 'mobx-react';
import { TOKEN } from '../../../../../../stores/interfaces';
import { isNotNFT } from '../../../../../../stores/Exchange/helpers';
import styled from 'styled-components';
import cn from 'classnames';
import { ThemeContext } from '../../../../../../themes/ThemeContext';
import { Button } from 'grommet';

interface Props {}

const BridgeControlStyled = styled(BridgeControl)`
  max-width: 180px;
`;

export const TokenAmount: React.FC<Props> = observer(() => {
  const { exchange, bridgeFormStore } = useStores();

  let maxAmount = '';
  if (
    ![TOKEN.ERC721, TOKEN.HRC721, TOKEN.ERC1155, TOKEN.HRC1155].includes(
      bridgeFormStore.data.token,
    )
  ) {
    maxAmount = formatWithSixDecimals(bridgeFormStore.tokenInfo.maxAmount);
  } else if ([TOKEN.ERC1155, TOKEN.HRC1155].includes(exchange.token)) {
    maxAmount = bridgeFormStore.tokenInfo.maxAmount;
  }

  const handleMaxAmount = () => {
    exchange.transaction.amount = maxAmount;
  };

  const themeContext = useContext(ThemeContext);

  return (
    <BridgeControlStyled
      title="Amount"
      gap="8px"
      centerContent={
        <NumberInput
          align="center"
          wrapperProps={{
            className: cn(s.wrapperClassName, {
              [s.wrapperDark]: themeContext.isDark(),
              [s.wrapperLight]: !themeContext.isDark(),
            }),
          }}
          margin="none"
          name="amount"
          type="decimal"
          min="0"
          precision="6"
          bgColor="transparent"
          border="none"
          delimiter="."
          placeholder="0"
          style={{ width: '100%', textAlign: 'center' }}
        />
      }
      bottomContent={
        <Button onClick={handleMaxAmount}>
          <Text size="xxsmall" color="NBlue">
            {maxAmount} Max Available
          </Text>
        </Button>
      }
    />
  );
});

TokenAmount.displayName = 'TokenAmount';
