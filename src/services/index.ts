import { IOperation, ITokenInfo } from '../stores/interfaces';
import * as agent from 'superagent';
import * as _ from 'lodash';

let servers = require('../../appengine-servers.json');

if (process.env.NETWORK === 'testnet') {
  servers = require('../../appengine-servers.testnet.json');
}

const threshold = process.env.THRESHOLD;

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
  return callAction(async url => {
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
): Promise<{ content: IOperation[] }> => {
  return callAvailableServer(async url => {
    const res = await agent.get<{ body: IOperation[] }>(
      url + '/operations/',
      params,
    );

    return res.body;
  });
};

export const getTokensInfo = async (
  params: any,
): Promise<{ content: ITokenInfo[] }> => {
  const res = await agent.get<{ body: ITokenInfo[] }>(
    process.env.ASSETS_INFO_SERVICE + '/tokens/',
    params,
  );

  let content = res.body.content;

  content = content.filter(t => {
    if (
      t.symbol === '1ONE' &&
      String(t.hrc20Address).toLowerCase() !==
        String(process.env.ONE_HRC20).toLowerCase()
    ) {
      return false;
    }

    return true;
  });

  content = _.uniqWith(
    content,
    (a: any, b: any) =>
      a.erc20Address === b.erc20Address && a.hrc20Address === b.hrc20Address,
  );

  return { ...res.body, content };
};

export const mintTokens = async ({ address, token }) => {
  const res = await agent.post<{
    body: { status: string; transactionHash: string; error: string };
  }>(`${servers[0]}/get-token`, { address, token });

  return res.body;
};

export const getDepositAmount = async () => {
  const res = await agent.get<number>(`${servers[0]}/deposit-amount`);

  return res.body;
};
