import { EXCHANGE_MODE, TOKEN } from 'stores/interfaces';
import { AddTokenString } from 'ui/AddToken';
import * as React from 'react';
import { useStores } from 'stores';
import { observer } from 'mobx-react-lite';

export const AddTokenPanel = observer((params: { position?: string }) => {
  const { exchange, userMetamask, user } = useStores();

  if (!userMetamask.erc20TokenDetails || !user.hrc20Address) {
    return null;
  }

  if (
    [TOKEN.ERC20, TOKEN.ETH].includes(exchange.token) &&
    exchange.mode === EXCHANGE_MODE.ETH_TO_ONE &&
    exchange.operation
  ) {
    return (
      <AddTokenString
        hrc20Address={user.hrc20Address}
        network={exchange.operation.network}
        symbol={userMetamask.erc20TokenDetails.symbol}
        decimals={userMetamask.erc20TokenDetails.decimals}
        position={params.position}
      />
    );
  }

  return null;
});
