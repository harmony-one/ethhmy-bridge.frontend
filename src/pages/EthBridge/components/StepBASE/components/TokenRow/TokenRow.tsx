import React from 'react';
import { Box } from 'grommet';
import { TokenControl } from '../TokenControl/TokenControl';
import { TokenAmount } from '../TokenAmount/TokenAmount';
import { TokenSettings } from '../TokenSettings/TokenSettings';
import { observer } from 'mobx-react';
import { useStores } from '../../../../../../stores';
import { BridgeControl } from '../../../BridgeControl/BridgeControl';
import { TOKEN } from '../../../../../../stores/interfaces';
import { truncateAddressString } from '../../../../../../utils';
import { isNFT } from '../../../../../../stores/Exchange/helpers';

interface Props {}

export const TokenRow: React.FC<Props> = observer(() => {
  const { exchange, erc20Select } = useStores();

  const displayTokenAddress = [TOKEN.ERC20, TOKEN.HRC20].includes(
    exchange.token,
  );

  return (
    <Box direction="column">
      <Box justify="center" align="center" pad={{ bottom: '16px' }}>
        <TokenSettings />
      </Box>
      <Box direction="row" justify="center">
        <Box basis="0" flex="grow">
          <TokenControl />
        </Box>
        {!isNFT(exchange.token) && (
          <Box alignSelf="center">
            {exchange.tokenInfo && (
              <img src={exchange.tokenInfo.image} width="40" />
            )}
          </Box>
        )}
        {!isNFT(exchange.token) && (
          <Box basis="0" flex="grow">
            <TokenAmount />
          </Box>
        )}
      </Box>
      {displayTokenAddress && (
        <Box justify="center" align="center" pad={{ top: 'xsmall' }}>
          <BridgeControl
            gap="8px"
            title="Token Address"
            centerContent={
              <a
                href={
                  exchange.token === TOKEN.HRC20
                    ? `${process.env.HMY_EXPLORER_URL}/address/${erc20Select.tokenAddress}`
                    : `${exchange.config.explorerURL}/token/${erc20Select.tokenAddress}`
                }
                target="_blank"
              >
                {truncateAddressString(erc20Select.tokenAddress, 8)}
              </a>
            }
          />
        </Box>
      )}
    </Box>
  );
});

TokenRow.displayName = 'TokenRow';
