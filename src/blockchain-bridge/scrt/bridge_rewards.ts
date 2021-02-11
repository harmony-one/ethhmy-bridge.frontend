import { ExecuteResult, SigningCosmWasmClient } from 'secretjs';
import { JsonObject } from 'secretjs/types/types';
import { Snip20Send } from './snip20';

interface IQueryRewards {
  rewards: {
    rewards: string;
  };
}

interface IQueryDeposit {
  deposit: {
    deposit: string;
  };
}

interface IQueryRewardPoolBalance {
  reward_pool_balance: {
    balance: string;
  };
}

export const QueryRewards = async (params: {
  cosmJS: SigningCosmWasmClient;
  contract: string;
  address: string;
  height: string;
  key: string;
}): Promise<JsonObject> => {
  const { cosmJS, contract, address, height, key } = params;

  const result: IQueryRewards = await cosmJS.queryContractSmart(contract, {
    rewards: {
      address,
      height: Number(height),
      key,
    },
  });

  return result.rewards.rewards;
};

export const QueryDeposit = async (params: {
  cosmJS: SigningCosmWasmClient;
  contract: string;
  address: string;
  key: string;
}): Promise<JsonObject> => {
  const { cosmJS, contract, address, key } = params;

  let result: IQueryDeposit = await cosmJS.queryContractSmart(contract, {
    deposit: {
      address,
      key,
    },
  });

  return result.deposit.deposit;
};

export const QueryRewardPoolBalance = async (params: {
  cosmJS: SigningCosmWasmClient;
  contract: string;
}): Promise<JsonObject> => {
  const { cosmJS, contract } = params;

  return await cosmJS.queryContractSmart(contract, {
    deposit: {},
  });
};

export const DepositRewards = async (params: {
  secretjs: SigningCosmWasmClient;
  recipient: string;
  address: string;
  amount: string;
}): Promise<string> => {
  const tx = await Snip20Send({
    msg: 'eyJkZXBvc2l0Ijp7fX0K', // '{"lock_tokens":{}}' -> base64
    ...params,
  });

  return 'yooyoo';
};

export const Redeem = async (params: {
  secretjs: SigningCosmWasmClient;
  address: string;
  amount: string;
}): Promise<ExecuteResult> => {
  const { secretjs, address, amount } = params;

  let result = await secretjs.execute(address, {
    redeem: {
      amount,
    },
  });

  return result;
};

export const Claim = async (params: { secretjs: SigningCosmWasmClient; address: string }): Promise<ExecuteResult> => {
  const { secretjs, address } = params;

  let result = await secretjs.execute(address, {
    claim_reward_pool: {},
  });

  return result;
};
