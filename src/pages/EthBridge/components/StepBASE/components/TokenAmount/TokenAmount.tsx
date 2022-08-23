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

interface Props {}

const BridgeControlStyled = styled(BridgeControl)`
  max-width: 180px;
`;

export const TokenAmount: React.FC<Props> = observer(() => {
  const { exchange } = useStores();

  let maxAmount = '';
  if (
    ![TOKEN.ERC721, TOKEN.HRC721, TOKEN.ERC1155, TOKEN.HRC1155].includes(
      exchange.token,
    )
  ) {
    maxAmount = formatWithSixDecimals(exchange.tokenInfo.maxAmount);
  } else if ([TOKEN.ERC1155, TOKEN.HRC1155].includes(exchange.token)) {
    maxAmount = exchange.tokenInfo.maxAmount;
  }

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
          precision={isNotNFT(exchange.token) ? '6' : '0'}
          bgColor="transparent"
          border="none"
          delimiter="."
          placeholder="0"
          style={{ width: '100%', textAlign: 'center' }}
          rules={[
            isRequired,
            moreThanZero,
            (_, value, callback) => {
              const errors = [];

              if (
                value &&
                Number(value) > Number(exchange.tokenInfo.maxAmount)
              ) {
                const defaultMsg = `Exceeded the maximum amount`;
                errors.push(defaultMsg);
              }

              callback(errors);
            },
          ]}
        />
      }
      bottomContent={
        <Text size="xxsmall" color="NBlue">
          {maxAmount} Max Available
        </Text>
      }
    />
  );
});

TokenAmount.displayName = 'TokenAmount';
