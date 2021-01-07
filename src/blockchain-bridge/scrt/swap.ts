import { SigningCosmWasmClient } from 'secretjs';
import { Currency, NativeToken, Trade, Token, Asset } from '../../pages/Swap/trade';

export const buildAssetInfo = (currency: Currency) => {

  if (currency.token.info.type === 'native_token') {
    return { info: { native_token: currency.token.info.native_token }, amount: currency.amount };
  } else {
    return {
      info:
        {
          token: {
            contract_addr: currency.token.info.token.contract_addr,
            token_code_hash: currency.token.info.token.token_code_hash,
            viewing_key: ""
          }
        },
      amount: currency.amount
    };
  }
}

export interface SimulationReponse {
  return_amount: string;
  spread_amount: string;
  commission_amount: string;
}

export interface PoolResponse {
  assets: Asset[];
  total_share: string;
}


export const SimulateResult = async (params: { secretjs: SigningCosmWasmClient, trade: Trade, pair: string }): Promise<SimulationReponse> => {
  console.log('heydgfdsf')
  const {secretjs, trade, pair } = params;

  console.log(`trade: ${pair}: ${JSON.stringify(buildAssetInfo(trade.inputAmount))}`)

  return await secretjs.queryContractSmart(pair, {
    simulation: {
      offer_asset: buildAssetInfo(trade.inputAmount)
    },
  });
}

export const GetPairLiquidity = async (params: { secretjs: SigningCosmWasmClient, pair: string }): Promise<PoolResponse> => {
  const {secretjs, pair } = params;

  return await secretjs.queryContractSmart(pair, {
    pool: {},
  });
}
