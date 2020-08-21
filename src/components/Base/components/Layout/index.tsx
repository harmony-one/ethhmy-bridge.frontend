import * as React from 'react';
import styled from 'styled-components';

type TFLex = 'flex-start' | 'center' | 'stretch' | 'flex-end' | 'space-between' | 'space-around';

interface ILayout {
  direction?: 'row' | 'column';
  hidden?: boolean;
  disabled?: boolean;
  tagName?: string;
  ai?: TFLex;
  jc?: TFLex;
  flex?: string;
  flexwrap?: string;
  margin?: string;
  padding?: string;
  style?: React.CSSProperties;
}

const getFlex = (flex: string) => (flex ? `flex: ${flex};` : '');

const StyledLayout = styled.div<any>`
  box-sizing: border-box;
  display: ${props => (props.hidden ? 'none' : 'flex')};
  opacity: ${props => (props.disabled ? '0.5' : '1')};
  flex-direction: ${props => (props.direction ? props.direction : 'column')};
  justify-content: ${props => (props.jc ? props.jc : 'flex-start')};
  align-items: ${props => (props.ai ? props.ai : 'center')};
  ${props => getFlex(props.flex)};
  flexwrap: ${props => (props.flexWrap ? 'wrap' : 'no-wrap')};
  padding: ${props => (props.padding ? props.padding : '')};
  margin: ${props => (props.margin ? props.margin : '')};
`;

export class Layout extends React.PureComponent<ILayout> {
  render() {
    return <StyledLayout {...this.props} />;
  }
}

export class Row extends React.PureComponent<ILayout> {
  render() {
    return <Layout {...this.props} direction="row" />;
  }
}

export class Col extends React.PureComponent<ILayout> {
  render() {
    return <Layout {...this.props} direction="column" />;
  }
}
