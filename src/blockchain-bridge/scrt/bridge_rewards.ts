import { ExecuteResult, SigningCosmWasmClient } from 'secretjs';
import { JsonObject } from 'secretjs/types/types';
import { Snip20Send } from './snip20';

interface IQueryRewards {
  query_rewards: {
    rewards: string
}
}

interface IQueryDeposit {
  query_deposit: {
    deposit: string
  }
}

interface IQueryRewardPoolBalance  {
  query_reward_pool_balance: {
    balance: string
  }
}

export const QueryRewards = async (params: { cosmJS: SigningCosmWasmClient, contract: string, address: string, height: string, key: string }): Promise<JsonObject> => {

  const {cosmJS, contract, address, height, key } = params;

  const result: IQueryRewards = await cosmJS.queryContractSmart(
    contract,
    {
      query_rewards: {
        address,
        height,
        key,
      },
    },
  );

  return result.query_rewards.rewards;
}


export const QueryDeposit = async (params: { cosmJS: SigningCosmWasmClient, contract: string, address: string, key: string }): Promise<JsonObject> => {

  const {cosmJS, contract, address, key } = params;

  let result: IQueryDeposit = await cosmJS.queryContractSmart(
    contract,
    {
      query_deposit: {
        address,
        key,
      },
    },
  );

  return result.query_deposit.deposit;
}

export const QueryRewardPoolBalance = async (params: { cosmJS: SigningCosmWasmClient, contract: string }): Promise<JsonObject> => {

  const {cosmJS, contract } = params;

  return await cosmJS.queryContractSmart(
    contract,
    {
      query_deposit: {},
    },
  );

}

export const DepositRewards = async (params: { secretjs: SigningCosmWasmClient, recipient: string, address: string, amount: string }): Promise<string> => {

  const tx = await Snip20Send({
    msg: "eyJsb2NrX3Rva2VucyI6e319Cg==",  // '{"lock_tokens":{}}' -> base64
    ...params
  });

  return "yooyoo";
}

export const Redeem = async (params: { cosmJS: SigningCosmWasmClient, address: string, amount: string }): Promise<ExecuteResult> => {

  const {cosmJS, address, amount } = params;

  let result = await cosmJS.execute(
    address,
    {
      redeem: {
        amount,
      },
    },
  );
  console.log('heyo');
  console.log(result);

  return result;
}
