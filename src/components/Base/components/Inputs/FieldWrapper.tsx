import { Box, Text } from 'grommet';
import * as React from 'react';
import styled from 'styled-components';

const MainBox = styled(Box)<any>`
  * {
    font-family: ${props =>
      props.theme.fontBase || 'Roboto-Medium", sans-serif'};
  }
`;

export interface IFieldWrapperProps {
  title: string;
  label: string;
  children: any;
  className: string;
  help: string;
  visible: boolean;
  isRowLabel: boolean;
  margin?: object;
}

export const FieldWrapper = (props: IFieldWrapperProps) => {
  const {
    title,
    label,
    children,
    className,
    help,
    visible = true,
    isRowLabel,
    margin,
  } = props;

  const text = title || label;

  return (
    <>
      {visible && (
        <MainBox
          margin={margin ? margin : { bottom: 'small' }}
          className={className}
        >
          {!isRowLabel && (
            <Box justify="center">
              {text && (
                <Text
                  margin={{ bottom: '8px' }}
                  style={{
                    fontSize: '18px',
                    color: '#212D5E',
                    fontWeight: "bold",
                  }}
                >
                  {text}
                </Text>
              )}
              {children}
            </Box>
          )}
          {isRowLabel && (
            <Box direction="row" align="start">
              {children}
              {label && (
                <Text color="#9698a7" margin={{ top: '4px' }}>
                  {label}
                </Text>
              )}
            </Box>
          )}
          {help && (
            <Box margin={{ top: 'xsmall' }}>
              <Text size="14px" color="#FF0000">
                {help}
              </Text>
            </Box>
          )}
        </MainBox>
      )}
    </>
  );
};
