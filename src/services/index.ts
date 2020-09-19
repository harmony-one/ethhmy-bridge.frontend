import { IOperation } from '../stores/interfaces';
import * as agent from 'superagent';

const servers = require('../../appengine-servers.json');

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

export const createOperation = async params => {
  return Promise.all(
    servers.map(async url => {
      const res = await agent.post<IOperation>(url + '/operations', params);

      return res.body;
    }),
  ).then((operations: any) => {
    if (operations.some(o => !o.id)) {
      throw new Error('Operation not created');
    }

    return operations[0];
  });
};

export const confirmAction = async ({
  operationId,
  actionType,
  transactionHash,
}) => {
  return Promise.all(
    servers.map(async url => {
      const res = await agent.post<{ body: IOperation }>(
        `${url}/operations/${operationId}/actions/${actionType}/confirm`,
        { transactionHash },
      );

      return res.body;
    }),
  ).then((actions: any) => {
    if (actions.some(o => !o.id)) {
      throw new Error('Actions not confirmed');
    }

    return actions[0];
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

export const getOperations = async (): Promise<IOperation[]> => {
  return callAvailableServer(async url => {
    const res = await agent.get<{ body: IOperation[] }>(url + '/operations/');

    return res.body;
  });
};

export const mintTokens = async ({ address, token }) => {
  const res = await agent.post<{
    body: { status: string; transactionHash: string; error: string };
  }>(`${servers[0]}/get-token`, { address, token });

  return res.body;
};
