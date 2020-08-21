export type TID = string | number;
export type TOrList<T> = T | Array<T>;

export type TWithout<T, Key extends keyof T> = {
  [K in Exclude<keyof T, Key>]: T[K];
};

export type TNullAllProperty<T> = { [K in keyof T]: null };

export type TNullableField<T, Key extends keyof T> = {
  [K in keyof T]: K extends Key ? T[K] | null : T[K];
};

export type TError = {
  status: number;
  message: string;
};

export type TErrorObject = {
  error: TError;
};

export type TLoading = { loading: boolean };

export type TCb<T = any, R = void> = (param: T) => R;
export type TFunc<T extends Array<any>, R> = (...args: T) => R;
