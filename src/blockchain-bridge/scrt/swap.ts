import { SigningCosmWasmClient } from 'secretjs';
import {
  Currency,
  NativeToken,
  Trade,
  Token,
  Asset,
  TradeType,
} from '../../pages/Swap/trade';

export const buildAssetInfo = (currency: Currency) => {
  if (currency.token.info.type === 'native_token') {
    return {
      info: { native_token: currency.token.info.native_token },
      amount: currency.amount,
    };
  } else {
    return {
      info: {
        token: {
          contract_addr: currency.token.info.token.contract_addr,
          token_code_hash: currency.token.info.token.token_code_hash,
          viewing_key: '',
        },
      },
      amount: currency.amount,
    };
  }
};

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

export const SimulateResult = async (params: {
  secretjs: SigningCosmWasmClient;
  trade: Trade;
  pair: string;
}): Promise<SimulationReponse> => {
  const { secretjs, trade, pair } = params;

  //console.log(`trade: ${pair}: ${JSON.stringify(buildAssetInfo(trade.inputAmount))}`)

  return await secretjs.queryContractSmart(pair, {
    simulation: {
      offer_asset: buildAssetInfo(trade.inputAmount),
    },
  });
};

export const ReverseSimulateResult = async (params: {
  secretjs: SigningCosmWasmClient;
  trade: Trade;
  pair: string;
}): Promise<ReverseSimulationResponse> => {
  const { secretjs, trade, pair } = params;

  console.log(
    `trade: ${pair}: ${JSON.stringify(buildAssetInfo(trade.outputAmount))}`,
  );

  return await secretjs.queryContractSmart(pair, {
    reverse_simulation: {
      ask_asset: buildAssetInfo(trade.outputAmount),
    },
  });
};

export const GetPairLiquidity = async (params: {
  secretjs: SigningCosmWasmClient;
  pair: string;
}): Promise<PoolResponse> => {
  const { secretjs, pair } = params;

  return await secretjs.queryContractSmart(pair, {
    pool: {},
  });
};

interface GenericSimulationResult {
  returned_asset: string;
  commission_amount: string;
  spread_amount: string;
}

export const handleSimulation = async (
  trade: Trade,
  secretjs: SigningCosmWasmClient,
  pair: string,
  swapDirection: TradeType,
): Promise<GenericSimulationResult> => {
  let returned_asset = '0';
  let commission_amount = '0';
  let spread_amount = '0';
  switch (swapDirection) {
    case TradeType.EXACT_INPUT:
      if (isNaN(Number(trade.inputAmount))) {
        console.error(1);
      }

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

      // console.log(
      //   'sim',
      //   `return_amount=${returned_asset}`,
      //   `commission_amount=${commission_amount}`,
      //   `spread_amount=${spread_amount}`,
      // );

      break;
    case TradeType.EXACT_OUTPUT:
      if (isNaN(Number(trade.outputAmount))) {
        console.error(2);
      }

      let resultReverse: ReverseSimulationResponse = await ReverseSimulateResult(
        {
          secretjs,
          trade,
          pair,
        },
      ).catch(err => {
        throw new Error(`Failed to run reverse simulation: ${err}`);
      });
      returned_asset = resultReverse.offer_amount;
      commission_amount = resultReverse.commission_amount;
      spread_amount = resultReverse.spread_amount;

      // console.log(
      //   'sim reverse',
      //   `offer_amount=${returned_asset}`,
      //   `commission_amount=${commission_amount}`,
      //   `spread_amount=${spread_amount}`,
      // );

      break;
  }

  return { returned_asset, spread_amount, commission_amount };
};

// Commission rate == 0.3%
const COMMISSION_RATE = 0.003;

// To reduce unnecessary queries, compute_swap is ported from here https://github.com/enigmampc/SecretSwap/blob/6135f0ad74a17cefacf4ac0e48497983b88dae91/contracts/secretswap_pair/src/contract.rs#L616-L636
export const compute_swap = (
  offer_pool: number,
  ask_pool: number,
  offer_amount: number,
): {
  return_amount: number;
  spread_amount: number;
  commission_amount: number;
} => {
  // offer => ask
  // ask_amount = (ask_pool - cp / (offer_pool + offer_amount)) * (1 - commission_rate)
  const cp = offer_pool * ask_pool;
  let return_amount = ask_pool - cp * (1 / (offer_pool + offer_amount));

  // calculate spread & commission
  const spread_amount = offer_amount * (ask_pool / offer_pool) - return_amount;
  const commission_amount = return_amount * COMMISSION_RATE;

  // commission will be absorbed to pool
  return_amount = return_amount - commission_amount;

  return { return_amount, spread_amount, commission_amount };
};

// To reduce unnecessary queries, cumpute_offer_amount is ported from here https://github.com/enigmampc/SecretSwap/blob/6135f0ad74a17cefacf4ac0e48497983b88dae91/contracts/secretswap_pair/src/contract.rs#L638-L661
export const compute_offer_amount = (
  offer_pool: number,
  ask_pool: number,
  ask_amount: number,
): {
  offer_amount: number;
  spread_amount: number;
  commission_amount: number;
} => {
  // ask => offer
  // offer_amount = cp / (ask_pool - ask_amount / (1 - commission_rate)) - offer_pool
  const cp = offer_pool * ask_pool;
  const one_minus_commission = 1 - COMMISSION_RATE;

  const offer_amount =
    cp * (1 / (ask_pool - ask_amount * reverse_decimal(one_minus_commission))) -
    offer_pool;

  const before_commission_deduction =
    ask_amount * reverse_decimal(one_minus_commission);

  let spread_amount = 0;
  try {
    spread_amount =
      offer_amount * (ask_pool / offer_pool) - before_commission_deduction;
  } catch (e) {}

  const commission_amount = before_commission_deduction * COMMISSION_RATE;
  return { offer_amount, spread_amount, commission_amount };
};

// reverse_decimal ported over from rust
// https://github.com/enigmampc/SecretSwap/blob/6135f0ad74a17cefacf4ac0e48497983b88dae91/contracts/secretswap_pair/src/math.rs#L4-L12
const DECIMAL_FRACTIONAL: number = 1_000_000_000;

export const reverse_decimal = (decimal: number): number => {
  if (decimal === 0) {
    return 0;
  }

  return DECIMAL_FRACTIONAL / (decimal * DECIMAL_FRACTIONAL);
};
