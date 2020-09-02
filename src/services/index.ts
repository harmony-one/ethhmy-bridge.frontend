import { IOperation } from '../stores/interfaces';
import * as agent from 'superagent';

const baseUrl = process.env.BACKEND_URL;

export const createOperation = async params => {
  const res = await agent.post<IOperation>(baseUrl + '/operations', params);

  return res.body;
};

export const getOperation = async (id): Promise<IOperation> => {
  const res = await agent.get<{ body: IOperation }>(
    baseUrl + '/operations/' + id,
  );

  return res.body;
};

export const getOperations = async (): Promise<IOperation[]> => {
  const res = await agent.get<{ body: IOperation[] }>(baseUrl + '/operations/');

  return res.body;
};

export const confirmAction = async ({
  operationId,
  actionId,
  transactionHash,
}) => {
  const res = await agent.post<{ body: IOperation }>(
    `${baseUrl}/operations/${operationId}/actions/${actionId}/confirm`,
    { transactionHash },
  );

  return res.body;
};

export const mintTokens = async ({ address, token }) => {
  const res = await agent.post<{
    body: { status: string; transactionHash: string; error: string };
  }>(`${baseUrl}/get-token`, { address, token });

  return res.body;
};
