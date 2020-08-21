import * as React from 'react';

import { Icon, Text } from 'components/Base';
import { getFilesWithHashes, useDerivedState } from './utils';
import { FileUploader } from './Uploader';

interface IFileInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: File[];
  onChange?(files: File[]): void;
}

export const FileInput = (props: IFileInputProps) => {
  const { value: valueFromProps, onChange, ...inputProps } = props;

  const [value, setValue] = useDerivedState<File[]>([], {
    value: valueFromProps,
    setValue: onChange,
  });

  const addFiles = async (files: File[]) => {
    if (!props.multiple) {
      return setValue(files);
    }

    const currentValueHashes = getFilesWithHashes(value).map(it => it.hash);

    const newValue = [...value];
    getFilesWithHashes(files).forEach(({ file, hash }) => {
      if (!currentValueHashes.includes(hash)) {
        newValue.push(file);
      }
    });

    setValue(newValue);
  };

  const clearFiles = () => setValue([]);
  const removeFile = (index: number) =>
    setValue(value.filter((file, fileIndex) => fileIndex !== index));

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist();

    const fromFileList = Array.from(e.currentTarget.files);
    addFiles(fromFileList);

    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: '325px' }}>
      <FileUploader
        amount={value.length}
        onClearClick={clearFiles}
        onChange={onChangeHandler}
        style={{ flex: 1 }}
        {...inputProps}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          flexDirection: 'column',
          marginTop: '5px',
        }}
      >
        {value.map((file, index) => (
          <div
            key={file.name + index}
            style={{ display: 'flex', justifyContent: 'space-between', lineHeight: '2' }}
          >
            <Text size="small">{file.name}</Text>
            <Icon size="xsmall" glyph="Trash" color="Basic500" onClick={() => removeFile(index)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export { getFileBase64, getFilesBase64, getFilesBase64Promise } from './utils';
