import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box } from 'grommet';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import { Button, Select, Text } from 'components/Base';
import { EXCHANGE_MODE, ITokenInfo } from 'stores/interfaces';

const selectTokenText = (mode: string, token: ITokenInfo) => {
  if (mode === EXCHANGE_MODE.SCRT_TO_ETH && !token.display_props.proxy) {
    return `Secret ${token.name} (secret${token.display_props.symbol})`;
  } else if (mode !== EXCHANGE_MODE.SCRT_TO_ETH && !token.display_props.proxy) {
    return `${token.display_props.label} (${token.display_props.symbol})`;
  } else if (mode === EXCHANGE_MODE.SCRT_TO_ETH) {
    return `Secret ${token.display_props.label} (secret${token.display_props.label})`;
  } else {
    return `${token.display_props.label} (${token.name})`;
  }
};

export const ERC20Select = observer((props: {
  onSelectToken?: Function,
  value: string,
}) => {

  const { userMetamask, exchange, tokens } = useStores();

  return (
    <Box direction="column">
      <Box direction="row" align="center" justify="between">
        <Text size="large" bold>
          Token
        </Text>
      </Box>

      <Box style={{ marginTop: 8 }}>
        <Select
          options={tokens.allData
            .slice()
            .sort((a, b) =>
              a.display_props.symbol.toLowerCase().includes('scrt') ? -1 : 1,
            )
            .map(token => ({
              ...token,
              image: token.display_props.image,
              text: selectTokenText(exchange.mode, token),
              value: token.src_address,
            }))}
          value={props.value}
          onChange={async value => {
            props.onSelectToken(value)
          }}
          placeholder="Select your token"
        />

      </Box>

    </Box>
  );
});
