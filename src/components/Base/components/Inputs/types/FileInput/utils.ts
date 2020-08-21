import { useState } from 'react';

export const getFilesBase64 = (files: File[], cb: (filesWithBase64: IFileWithBase64[]) => void) => {
  const result: IFileWithBase64[] = [];

  files.forEach((file, index) =>
    getFileBase64(file, base64 => {
      result[index] = { file, base64 };

      if (result.length === files.length) {
        cb(result);
      }
    })
  );
};

export const getFilesBase64Promise = (files: File[]): Promise<IFileWithBase64[]> =>
  Promise.all(files.map(async file => ({ file, base64: await getFileBase64Promise(file) })));

export const getFileBase64 = (file: File, cb: (base64: string) => void) => onReadAsBase64(file)(cb);

const getFileBase64Promise = (file: File): Promise<string> =>
  new Promise(resolve => onReadAsBase64(file)(resolve));

const onReadAsBase64 = (file: File) => (cb: (base64: string) => void) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => cb(reader.result as string);
};

export const useDerivedState = <T = unknown>(
  defaultValue: T,
  paramsToSync: Partial<IParamsToSync<T>> = {}
): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(defaultValue);
  const derivedValue = paramsToSync.value || value;

  const setDerivedValue = (newValue: T) => {
    setValue(newValue);
    if (typeof paramsToSync.setValue === 'function') {
      paramsToSync.setValue(newValue);
    }
  };

  return [derivedValue, setDerivedValue];
};

export const getFilesWithHashes = (files: File[]) =>
  files.map(file => ({ file, hash: getFileHash(file) }));

const getFileHash = (file: File) => {
  // JSON.stringify returns '{}' for any File, so we copy all props manually
  const filePropsCopy = {};

  for (const prop in file) {
    filePropsCopy[prop] = file[prop];
  }

  return JSON.stringify(filePropsCopy);
};

interface IParamsToSync<T> {
  value: T;
  setValue(value: T): void;
}

interface IFileWithBase64 {
  file: File;
  base64: string;
}
