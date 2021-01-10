import { SigningCosmWasmClient } from 'secretjs';
import { Currency, NativeToken, Trade, Token, Asset, TradeType } from '../../pages/Swap/trade';

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

export interface ReverseSimulationResponse {
  offer_amount: string;
  spread_amount: string;
  commission_amount: string;
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
  const {secretjs, trade, pair } = params;

  //console.log(`trade: ${pair}: ${JSON.stringify(buildAssetInfo(trade.inputAmount))}`)

  return await secretjs.queryContractSmart(pair, {
    simulation: {
      offer_asset: buildAssetInfo(trade.inputAmount)
    },
  });
}

export const ReverseSimulateResult = async (params: { secretjs: SigningCosmWasmClient, trade: Trade, pair: string }): Promise<ReverseSimulationResponse> => {
  const {secretjs, trade, pair } = params;

  console.log(`trade: ${pair}: ${JSON.stringify(buildAssetInfo(trade.outputAmount))}`)

  return await secretjs.queryContractSmart(pair, {
    reverse_simulation: {
      ask_asset: buildAssetInfo(trade.outputAmount)
    },
  });
}

export const GetPairLiquidity = async (params: { secretjs: SigningCosmWasmClient, pair: string }): Promise<PoolResponse> => {
  const {secretjs, pair } = params;

  return await secretjs.queryContractSmart(pair, {
    pool: {},
  });
}

interface GenericSimulationResult {
  returned_asset: string;
  commission_amount: string;
  spread_amount: string;
}

export const handleSimulation = async (trade: Trade, secretjs: SigningCosmWasmClient, pair: string, swapDirection: TradeType): Promise<GenericSimulationResult> => {

  let returned_asset = "0";
  let commission_amount = "0";
  let spread_amount = "0";
  console.log(swapDirection)
  switch (swapDirection) {
    case TradeType.EXACT_INPUT:
      let result: SimulationReponse = await SimulateResult({
        secretjs,
        trade,
        pair,
      }).catch(err => {
        throw new Error(`Failed to run simulation: ${err}`);
      });

      returned_asset = result.return_amount;
      commission_amount = result.commission_amount;
      spread_amount = result.spread_amount;

      break;
    case TradeType.EXACT_OUTPUT:
      let resultReverse: ReverseSimulationResponse = await ReverseSimulateResult({
        secretjs,
        trade,
        pair,
      }).catch(err => {
        throw new Error(`Failed to run reverse simulation: ${err}`);
      });
      returned_asset = resultReverse.offer_amount;
      commission_amount = resultReverse.commission_amount;
      spread_amount = resultReverse.spread_amount;

      break;

  }

  return {returned_asset, spread_amount, commission_amount}

}
