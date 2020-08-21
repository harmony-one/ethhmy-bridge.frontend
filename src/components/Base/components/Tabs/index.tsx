import * as React from 'react';
import styled from 'styled-components';
import { Row } from '../Layout';

export const Tabs: React.FunctionComponent<IProps> = ({
  onChange,
  selected,
  tabs,
  small,
  children,
  ...rest
}) => (
  <Row {...rest}>
    {tabs.map(item => (
      <Tab key={item.id} onChange={onChange} selected={selected} small={small} {...item} />
    ))}
    {children}
  </Row>
);

const Tab: React.FunctionComponent<ITabProps> = ({
  selected,
  id,
  text,
  onChange,
  className,
  titleText,
  small,
  disabled,
  ...rest
}) => (
  <StyledTab
    active={selected === id}
    disabled={disabled}
    onClick={() => onChange && !disabled && onChange(id)}
    {...rest}
  >
    {text instanceof Function ? text() : text}
  </StyledTab>
);

const StyledTab = styled.div<any>`
  padding: ${props => props.theme.styled.tabs.tab.padding || ''};
  margin: ${props => props.theme.styled.tabs.tab.margin || ''};
  color: ${props =>
    props.active ? props.theme.styled.tabs.tab.colorActive : props.theme.styled.tabs.tab.color}
  background-color: ${props =>
    props.active
      ? props.theme.styled.tabs.tab.backgroundColorActive
      : props.theme.styled.tabs.tab.backgroundColor}
  border: ${props => props.theme.styled.tabs.tab.border};
  border-bottom: ${props =>
    `${props.theme.styled.tabs.activeBorderBottomWidth}px solid ${
      props.theme.styled.tabs.activeBorderBottomWidth > 0 && props.active
        ? props.theme.styled.tabs.activeBorderBottomColor
        : 'transparent'
    }`};
  font-family: ${props => props.theme.fontBase};
  font-size: ${props => props.theme.styled.tabs.tab.fontSize || '15px'}
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  cursor: ${props => (props.disabled ? 'auto' : 'pointer')};
`;

interface ITabProps extends ITabOptions, React.ComponentProps<any> {
  selected?: string;
  onChange?(id: string): void;
  small?: boolean;
}

export interface ITabOptions {
  id: string;
  text: string | React.ReactNode;
  titleText?: string;
  className?: string;
  disabled?: boolean;
}

interface IProps {
  selected?: string;
  onChange?(id: string): void;
  className?: string;
  tabs: ITabOptions[];
  small?: boolean;
}
