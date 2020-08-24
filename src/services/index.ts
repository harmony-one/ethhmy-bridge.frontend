import { IOperation, OPERATION_TYPE } from '../stores/interfaces';
import * as agent from 'superagent';

const baseUrl = 'http://localhost:8080';

export const createOperation = async (transaction, type) => {
  const res = await agent.post<IOperation>(baseUrl + '/operations', {
    ...transaction,
    type,
  });

  return res.body;
};

export const getOperation = async (id): Promise<IOperation> => {
  const res = await agent.get<{ body: IOperation }>(
    baseUrl + '/operations/' + id,
  );

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
