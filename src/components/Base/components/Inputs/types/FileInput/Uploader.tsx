import { Icon, Text, Title } from 'components/Base';
import * as React from 'react';
import styled from 'styled-components';

interface IFileUploaderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  amount: number;
  onClearClick(): void;
}

export const FileUploader = ({ amount, onClearClick, ...rest }: IFileUploaderProps) => (
  <FileWrap>
    {amount === 0 && (
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon glyph="PrintFormDownload" color="Basic500" margin={{ bottom: 'xsmall' }} />
        <Title bold size="xxsmall" color="Basic500">
          Загрузите или переместите файл
        </Title>
      </div>
    )}
    {amount > 0 && (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text size="small">Выбрано файлов: {amount}</Text>
        <div
          style={{
            cursor: 'pointer',
            marginLeft: '12px',
            zIndex: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon glyph="Close" color="Basic500" size="16px" onClick={onClearClick} />
        </div>
      </div>
    )}
    <InputContainer>
      <input type="file" {...rest} />
    </InputContainer>
  </FileWrap>
);

export const FileWrap = styled.div`
  position: relative;
  border: ${(props: any) => `1px dashed ${props.theme.palette.Basic500}`};
  cursor: pointer;
  padding: 24px;
  height: 40px;

  display: flex;
  justify-content: center;
  align-items: center;

  transition: 0.3s all;

  &:hover {
    opacity: 0.85;
  }
`;

export const InputContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  z-index: 2;

  input {
    width: 100%;
    height: 100%;
    cursor: pointer;
    position: relative;
  }
`;
