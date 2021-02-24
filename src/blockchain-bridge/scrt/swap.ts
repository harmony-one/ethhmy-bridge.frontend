import BigNumber from 'bignumber.js';
import { storeTxResultLocally } from 'pages/Swap/utils';
import { ExecuteResult, SigningCosmWasmClient } from 'secretjs';
import { Asset, Currency, NativeToken, Token, Trade, TradeType } from '../../pages/Swap/types/trade';
import { GetContractCodeHash } from './snip20';
import { extractValueFromLogs, getFeeForExecute, validateBech32Address } from './utils';

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

  console.log(`trade: ${pair}: ${JSON.stringify(buildAssetInfo(trade.outputAmount))}`);

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
const COMMISSION_RATE = new BigNumber(0.3 / 100);

// To reduce unnecessary queries, compute_swap is ported from here https://github.com/enigmampc/SecretSwap/blob/6135f0ad74a17cefacf4ac0e48497983b88dae91/contracts/secretswap_pair/src/contract.rs#L616-L636
export const compute_swap = (
  offer_pool: BigNumber,
  ask_pool: BigNumber,
  offer_amount: BigNumber,
): {
  return_amount: BigNumber;
  spread_amount: BigNumber;
  commission_amount: BigNumber;
} => {
  // offer => ask
  // ask_amount = (ask_pool - cp / (offer_pool + offer_amount)) * (1 - commission_rate)
  const cp = offer_pool.multipliedBy(ask_pool);
  let return_amount = ask_pool.minus(cp.multipliedBy(new BigNumber(1).dividedBy(offer_pool.plus(offer_amount))));

  // calculate spread & commission
  const spread_amount = offer_amount.multipliedBy(ask_pool.dividedBy(offer_pool)).minus(return_amount);
  const commission_amount = return_amount.multipliedBy(COMMISSION_RATE);

  // commission will be absorbed to pool
  return_amount = return_amount.minus(commission_amount);

  return { return_amount, spread_amount, commission_amount };
};

// To reduce unnecessary queries, cumpute_offer_amount is ported from here https://github.com/enigmampc/SecretSwap/blob/6135f0ad74a17cefacf4ac0e48497983b88dae91/contracts/secretswap_pair/src/contract.rs#L638-L661
export const compute_offer_amount = (
  offer_pool: BigNumber,
  ask_pool: BigNumber,
  ask_amount: BigNumber,
): {
  offer_amount: BigNumber;
  spread_amount: BigNumber;
  commission_amount: BigNumber;
} => {
  // ask => offer
  // offer_amount = cp / (ask_pool - ask_amount / (1 - commission_rate)) - offer_pool
  const cp = offer_pool.multipliedBy(ask_pool);
  const one_minus_commission = new BigNumber(1).minus(COMMISSION_RATE);

  const offer_amount = cp
    .multipliedBy(
      new BigNumber(1).dividedBy(ask_pool.minus(ask_amount.multipliedBy(reverse_decimal(one_minus_commission)))),
    )
    .minus(offer_pool);

  const before_commission_deduction = ask_amount.multipliedBy(reverse_decimal(one_minus_commission));

  let spread_amount = new BigNumber(0);
  try {
    spread_amount = offer_amount.multipliedBy(ask_pool.dividedBy(offer_pool)).minus(before_commission_deduction);
  } catch (e) {}

  const commission_amount = before_commission_deduction.multipliedBy(COMMISSION_RATE);
  return { offer_amount, spread_amount, commission_amount };
};

// reverse_decimal ported over from rust
// https://github.com/enigmampc/SecretSwap/blob/6135f0ad74a17cefacf4ac0e48497983b88dae91/contracts/secretswap_pair/src/math.rs#L4-L12
const DECIMAL_FRACTIONAL = new BigNumber(1_000_000_000);

export const reverse_decimal = (decimal: BigNumber): BigNumber => {
  if (decimal.isEqualTo(0)) {
    return new BigNumber(0);
  }

  return DECIMAL_FRACTIONAL.dividedBy(decimal.multipliedBy(DECIMAL_FRACTIONAL));
};

interface CreatePairResponse {
  contractAddress: string;
}

export const CreateNewPair = async ({
  secretjs,
  tokenA,
  tokenB,
}: {
  secretjs: SigningCosmWasmClient;
  tokenA: Asset;
  tokenB: Asset;
}): Promise<CreatePairResponse> => {
  let asset_infos = [];
  for (const t of [tokenA, tokenB]) {
    // is a token
    if ('token' in t.info) {
      if (!validateBech32Address(t.info.token.contract_addr)) {
        throw new Error('Token address is not valid');
      }
      const token = t.info.token;
      try {
        token.token_code_hash = await GetContractCodeHash({ secretjs, address: token.contract_addr });
      } catch (e) {
        throw `Error fetching code hash for ${t.symbol} ${t.info.token.contract_addr}: ${e.message}`;
      }

      asset_infos.push({ token });
    } else {
      asset_infos.push({ native_token: t.info.native_token });
    }
  }

  const factoryAddress = process.env.AMM_FACTORY_CONTRACT;
  const pairCodeId = Number(process.env.AMM_PAIR_CODE_ID);
  const response: ExecuteResult = await secretjs.execute(
    factoryAddress,
    {
      create_pair: { asset_infos },
    },
    '',
    [],
    getFeeForExecute(1_000_000),
  );
  storeTxResultLocally(response);

  let contractAddress: string;
  try {
    contractAddress = extractValueFromLogs(response, 'pair_contract_addr');
  } catch (_) {
    contractAddress = (await secretjs.getContracts(pairCodeId))[-1].address;
  }

  return { contractAddress };
};

interface GetAllPairsResponse {
  pairs: Array<Pair>;
}

export const GetAllPairs = async (params: { secretjs: SigningCosmWasmClient }): Promise<GetAllPairsResponse> => {
  const { secretjs } = params;
  return await secretjs.queryContractSmart(process.env.AMM_FACTORY_CONTRACT, {
    pairs: { limit: 30 },
  });
};

export type Pair = {
  asset_infos: Array<NativeToken | Token>;
  contract_addr: string;
  liquidity_token: string;
  token_code_hash: string;
};

export const getSymbolsFromPair = (pair: Pair): string[] => {
  const symbols = [];

  if ('native_token' in pair.asset_infos[0]) {
    symbols.push(pair.asset_infos[0].native_token.denom);
  } else {
    symbols.push(pair.asset_infos[0].token.contract_addr);
  }
  if ('native_token' in pair.asset_infos[1]) {
    symbols.push(pair.asset_infos[1].native_token.denom);
  } else {
    symbols.push(pair.asset_infos[1].token.contract_addr);
  }

  return symbols;
};
