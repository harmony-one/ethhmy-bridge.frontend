import {
  ACTION_TYPE, IIdentityTokenInfo,
  IOperation,
  ITokenInfo,
  NETWORK_TYPE,
  OpenSeaSingleAssetResponse,
  OpenSeaValideResponse,
  TFullConfig,
} from '../stores/interfaces';
import * as agent from 'superagent';
import { getCorrectArr } from './helpers';
import { sleep } from '../utils';
import qs from 'qs';

let serversJson = require('../../appengine-servers.json');

if (process.env.NETWORK === 'testnet') {
  serversJson = require('../../appengine-servers.testnet.json');
}

export const threshold = 3; //process.env.THRESHOLD;

export const getValidators = async () => {
  const availableValidators = await Promise.all(
    serversJson.map(async url => {
      try {
        const res = await fetch(url + '/version').then(response =>
          response.json(),
        );

        if (!!res.version) {
          return url;
        }
      } catch (e) {}

      return false;
    }),
  );

  return availableValidators.filter(v => !!v).slice(0, threshold);
};

export let validators = serversJson;
export let servers = serversJson;

getValidators().then(res => {
  validators = res;
  servers = res;
});

const callAvailableServer = async (
  func: (url: string) => Promise<any>,
  server = 0,
) => {
  let error;

  for (let i = server; i < servers.length; i++) {
    try {
      return await func(servers[i]);
    } catch (e) {
      error = e;
    }
  }

  throw error;
};

const callAvailableServerAll = async (
  func: (url: string) => Promise<any>,
  server = 0,
) => {
  let error;

  const resArray = [];

  for (let i = server; i < servers.length; i++) {
    try {
      const res = await func(servers[i]);

      resArray.push(res);
    } catch (e) {
      error = e;
    }
  }

  if (!resArray.length) {
    throw error;
  }

  resArray[0].content = resArray[0].content.map((item, idx) => {
    const arrIndex = getCorrectArr(
      [
        resArray[0] ? resArray[0].content[idx].actions : [],
        resArray[1] ? resArray[1].content[idx].actions : [],
        resArray[2] ? resArray[2].content[idx].actions : [],
      ],
      'status',
    );

    return { ...resArray[arrIndex].content[idx], id: item.id };
  });

  return resArray[0];
};

const callActionN = async (func: (url: string) => Promise<any>) => {
  let error;
  let confirmSuccess = 0;
  let res;

  for (let i = 0; i < servers.length; i++) {
    try {
      res = await func(servers[i]);
      confirmSuccess++;
    } catch (e) {
      error = e;
    }
  }

  if (confirmSuccess >= Number(threshold)) {
    return res;
  }

  throw error;
};

const callAction = async (func: (url: string) => Promise<any>) => {
  let error;

  const res: any[] = await Promise.all(
    servers.map(async url => {
      try {
        return await func(url);
      } catch (e) {
        error = e;
        return false;
      }
    }),
  );

  const success = res.filter(r => !!r);

  if (success.length >= Number(threshold)) {
    return success[0];
  }

  throw error;
};

const callActionWait = async (
  func: (url: string) => Promise<any>,
  countN = 15,
) => {
  let error;
  let success = false;
  let res;
  let count = countN;

  while (!success && count > 0) {
    try {
      res = await Promise.all(
        servers.map(async url => {
          try {
            return await func(url);
          } catch (e) {
            error = e;
            return false;
          }
        }),
      );

      success = res.filter(r => !!r).length >= Number(threshold);

      if (!success) {
        await sleep(5000);
      }
    } catch (e) {
      console.error(e);
      await sleep(5000);
    }
    count--;
  }

  if (success) {
    return res[0];
  }

  throw error;
};

export const createOperation = async params => {
  return callAction(async url => {
    const res = await agent.post<IOperation>(url + '/operations', params);

    return res.body;
  });
};

export const confirmAction = async ({
  operationId,
  actionType,
  transactionHash,
}) => {
  return callActionWait(async url => {
    const res = await agent.post<{ body: IOperation }>(
      `${url}/operations/${operationId}/actions/${actionType}/confirm`,
      { transactionHash },
    );

    return res.body;
  });
};

export const getOperation = async (id): Promise<IOperation> => {
  return callAvailableServer(async url => {
    const res = await agent.get<{ body: IOperation }>(
      url + '/operations/' + id,
    );

    return res.body;
  });
};

export const getOperations = async (
  params: any,
  url = validators[0],
): Promise<{ content: IOperation[] }> => {
  const res = await agent.get<{ body: IOperation[] }>(
    url + '/operations/',
    params,
  );

  return res.body;
};

export const getTokensInfo = async (
  params: any,
): Promise<{ content: ITokenInfo[] }> => {
  const res = await agent.get<{ body: ITokenInfo[] }>(
    process.env.ASSETS_INFO_SERVICE + '/tokens/',
    params,
  );

  return res.body;
};

export const getIdentityTokensInfo = async (
  params: any,
): Promise<{ content: IIdentityTokenInfo[] }> => {
  const res = await agent.get<{ body: IIdentityTokenInfo[] }>(
    process.env.ASSETS_INFO_SERVICE + '/itokens/',
    params,
  );

  return res.body;
};

export const mintTokens = async ({ address, token }) => {
  const res = await agent.post<{
    body: { status: string; transactionHash: string; error: string };
  }>(`${servers[0]}/get-token`, { address, token });

  return res.body;
};

export const getConfig = async (): Promise<TFullConfig> => {
  const res = await agent.get<{
    body: any;
  }>(`${servers[0]}/config`);

  return res.body;
};

export const getDepositAmount = async (
  network: NETWORK_TYPE,
  otherOptions: Record<string, string>,
) => {
  const res = await agent.get<number>(
    `${servers[0]}/deposit-amount/${network}?${new URLSearchParams(
      otherOptions,
    )}`,
  );

  return res.body;
};

export const manage = async (
  action: string,
  secret: string,
  params: {
    operationId?: string;
    actionType?: ACTION_TYPE;
    transactionHash?: string;
    value?: number;
    network?: NETWORK_TYPE;
  },
) => {
  return callActionWait(async url => {
    const res = await agent.post<{ body: IOperation }>(
      `${url}/manage/actions/${action}`,
      { secret, ...params },
    );

    return res.body;
  }, 1);
};

export const getOperationsAdminFullHistory = async (
  params: any,
  secret: string,
  url = validators[0],
): Promise<{ content: IOperation[] }> => {
  const res = await agent.post<{ body: IOperation }>(
    `${url}/manage/operations/history?${qs.stringify(params)}`,
    { secret },
  );

  return res.body;
};

export const getOperationsAdmin = async (
  params: any,
  secret: string,
  url = validators[0],
): Promise<{ content: IOperation[] }> => {
  const res = await agent.post<{ body: IOperation }>(
    `${url}/manage/operations?${qs.stringify(params)}`,
    { secret },
  );

  return res.body;
};

export const hasOpenSeaValid = async (
  erc20Address: string,
): Promise<OpenSeaValideResponse | null> => {
  try {
    const res = await agent.get<OpenSeaValideResponse>(
      `https://api.opensea.io/api/v1/asset_contract/${erc20Address}?format=json`,
    );

    return res.body;
  } catch (e) {
    return null;
  }
};

export const getOpenSeaSingleAsset = async (
  assetAddress: string,
  assetId: string,
): Promise<OpenSeaSingleAssetResponse | null> => {
  try {
    const res = await agent.get<OpenSeaSingleAssetResponse>(
      `https://api.opensea.io/api/v1/asset/${assetAddress}/${assetId}/?format=json`,
    );

    return res.body;
  } catch (e) {
    return null;
  }
};

export const getUIConfig = async (): Promise<{
  assetsBlackList: string[];
  blockers: string[];
}> => {
  const res = await agent.get<{ body: IOperation }>(
    `${validators[0]}/ui-config`,
  );

  return res.body;
};

// @ts-ignore
window.getServers = () => {
  return servers;
};
