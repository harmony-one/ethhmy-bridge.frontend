import * as React from 'react';

import styled from 'styled-components';

interface IDisableWrapProps {
  disabled?: boolean;
  opacity?: number;
}

const Disabled = styled.div<any>`
  position: relative;
  
  width: 100%;

  &:after {
    position: absolute;
    content: ' ';
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 2;

    background-color: white;
    opacity: ${props => props.opacity};
  }

  * {
    user-select: none;
  }
`;

export class DisableWrap extends React.Component<IDisableWrapProps> {
  onClick = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
  };

  render() {
    const { children, disabled, opacity = 0.6 } = this.props;

    if (disabled) {
      return (
        <Disabled disabled={disabled} opacity={opacity} onClick={this.onClick}>
          {children}
        </Disabled>
      );
    }

    return children;
  }
}
