export const errorTypes = {
  SILENT: 'SILENT',
};

export interface IDataError extends Error {
  data?: any;
}

export function createError(
  name: string,
  message: string,
  data?: any,
): IDataError {
  const newError: IDataError = new Error(message);

  newError.name = name;
  if (data) {
    newError.data = data;
  }

  return newError;
}

export const silentError = createError(errorTypes.SILENT, '');

export function isSilentError(error: IDataError): boolean {
  return error && error.name === errorTypes.SILENT;
}

export function handleSilentError(error: IDataError) {
  if (error.name === 'SILENT') {
    return Promise.resolve();
  }

  throw error;
}

export type HttpResponseError = Error & {
  response: {
    body: {
      error: string;
      text: string;
    };
  };
};

export function printError(error: any): string {
  if (typeof error === 'string') {
    return error;
  } if (typeof error === 'object') {
    if ('message' in error) {
      return error.message;
    }
  }
  return '';
}
