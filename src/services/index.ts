import { IOperation, ISwap, ITokenInfo } from '../stores/interfaces';
import * as agent from 'superagent';

const servers = require('../../appengine-servers.json');

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

const callAction = async (func: (url: string) => Promise<any>) => {
  let error;

  // todo: this is stupid
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

export const getStatus = async params => {
  return callAction(async url => {
    const res = await agent.get<IOperation>(url + `/operations/${params.id}`);

    if (res.body.swap) {
      return res.body.swap.status
    } else {
      return res.body.operation.status
    }
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
      url + '/swaps/' + id,
    );

    return res.body;
  });
};

export const getOperations = async (
  params: any,
): Promise<{ content: ISwap[] }> => {
  return callAvailableServer(async url => {
    const res = await agent.get<{ body: ISwap[] }>(
      url + '/swaps/',
      params,
    );

    const content = res.body.swaps;

    return { content: content };
  });
};

export const getTokensInfo = async (
  params: any,
): Promise<{ content: ITokenInfo[] }> => {
  const res = await agent.get<{ body: {tokens: ITokenInfo[]} }>(
    'http://localhost:8000' + '/tokens/',
    params,
  );

  const content = res.body.tokens;

  return { ...res.body, content };
  // return await callAvailableServer(async url => {
  //   const res = await agent.get<{ body: ITokenInfo[] }>(
  //     url + '/tokens/',
  //     params,
  //   );
  //
  //   const content = res.body.content;
  //
  //   return { ...res.body, content };
  //
  // });
};


// todo: remove this
export const mintTokens = async ({ address, token }) => {
  const res = await agent.post<{
    body: { status: string; transactionHash: string; error: string };
  }>(`${servers[0]}/get-token`, { address, token });

  return res.body;
};
