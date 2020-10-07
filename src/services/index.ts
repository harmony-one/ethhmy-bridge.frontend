import { IOperation, ITokenInfo } from '../stores/interfaces';
import * as agent from 'superagent';

const servers = require('../../appengine-servers.json');

const threshold = process.env.THRESHOLD;

const callAvailableServer = async (func: (url: string) => Promise<any>) => {
  let error;

  for (let i = 0; i < servers.length; i++) {
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
  return callAvailableServer(async url => {
    const res = await agent.get<{ body: ITokenInfo[] }>(
      url + '/tokens/',
      params,
    );

    return res.body;
  });
};

export const mintTokens = async ({ address, token }) => {
  const res = await agent.post<{
    body: { status: string; transactionHash: string; error: string };
  }>(`${servers[0]}/get-token`, { address, token });

  return res.body;
};
