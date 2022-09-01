import React, { useRef, useState } from 'react';
import { Box, Tip } from 'grommet';
import { Text } from '../../../../../../components/Base';
import { TokenControl } from '../TokenControl/TokenControl';
import { TokenAmount } from '../TokenAmount/TokenAmount';
import { TokenSettings } from '../TokenSettings/TokenSettings';
import { observer } from 'mobx-react';
import { useStores } from '../../../../../../stores';
import { BridgeControl } from '../../../BridgeControl/BridgeControl';
import { TOKEN } from '../../../../../../stores/interfaces';
import { truncateAddressString } from '../../../../../../utils';
import { isNFT } from '../../../../../../stores/Exchange/helpers';
import { CircleQuestion } from 'grommet-icons';
import { TipContent } from '../../../../../../components/TipContent';
import { Link } from 'components/Link';

interface Props {}

export const TokenRow: React.FC<Props> = observer(() => {
  const { exchange, erc20Select, tokens } = useStores();

  const mappedAddress = tokens.getMappedAddress(erc20Select.tokenAddress);

  const originAddressLink =
    exchange.token === TOKEN.HRC20
      ? `${process.env.HMY_EXPLORER_URL}/address/${erc20Select.tokenAddress}`
      : `${exchange.config.explorerURL}/token/${erc20Select.tokenAddress}`;

  const mappedAddressLink =
    exchange.token !== TOKEN.HRC20
      ? `${process.env.HMY_EXPLORER_URL}/address/${erc20Select.tokenAddress}`
      : `${exchange.config.explorerURL}/token/${erc20Select.tokenAddress}`;

  const displayTokenAddress =
    [TOKEN.ERC20, TOKEN.HRC20].includes(exchange.token) &&
    erc20Select.tokenAddress;

  const [tipRef, setTipRef] = useState();

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
          <Box pad={{ top: '12px' }}>
            {exchange.tokenInfo && (
              <img src={exchange.tokenInfo.image} width="40" />
            )}
          </Box>
        )}
        {!isNFT(exchange.token) && (
          <Box basis="0" flex="grow" align="center">
            <TokenAmount />
          </Box>
        )}
      </Box>
      {displayTokenAddress && (
        <Box justify="center" align="center" pad={{ top: 'xsmall' }}>
          <BridgeControl
            gap="8px"
            title={
              <Box
                ref={ref => setTipRef(ref)}
                direction="row"
                align="center"
                gap="4px"
              >
                <Text>Token Address</Text>
                <Tip
                  dropProps={{
                    align: { bottom: 'top' },
                    target: tipRef,
                  }}
                  plain
                  content={
                    <TipContent round="7px" pad="xsmall">
                      <Text size="xsmall">
                        Make sure that you are transferring tokens to a liquid
                        address
                      </Text>
                    </TipContent>
                  }
                >
                  <CircleQuestion size="12px" />
                </Tip>
              </Box>
            }
            centerContent={
              <Box>
                <Text bold>
                  <Link
                    monospace
                    href={originAddressLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {truncateAddressString(erc20Select.tokenAddress, 8)}
                  </Link>
                </Text>
                <Text bold>
                  <Link
                    monospace
                    href={mappedAddressLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {truncateAddressString(mappedAddress, 8)}
                  </Link>
                </Text>
              </Box>
            }
          />
        </Box>
      )}
    </Box>
  );
});

TokenRow.displayName = 'TokenRow';
