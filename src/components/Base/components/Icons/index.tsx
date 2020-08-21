import cn from 'classnames';
import * as React from 'react';
import styled, { withTheme } from 'styled-components';

import * as icons from './tsx_svg_icons';

import { TEdgeSize, getMarginCSS, getPaddingCSS } from '../../utils';
import { ITooltipProps, Tooltip } from '../Tooltip';
import styles from './styles.styl';

interface IIconProps {
  glyph: string;
  size?: string;
  hover?: boolean;
  hoverColor?: string;
  activeColor?: string;
  tooltip?: ITooltipProps;
  pad?: TEdgeSize;
  margin?: TEdgeSize;
  [name: string]: any;
  stopPropagation?: boolean;
  nativeClick?: boolean;
}

interface IRenderIConProps {
  hover?: boolean;
  component: any;
  [name: string]: any;
}

function getSVGSize(size: string) {
  switch (size) {
    case 'xsmall':
    case 'small':
      return '12px';
    case 'medium':
      return '20px';
    case 'large':
      return '24px';

    default:
      return size || '20px';
  }
}

function getThemeColor(color: string, theme: any) {
  const { palette } = theme;

  return palette[color] || color || '#000';
}

function convertToSVGProps(props: Partial<IRenderIConProps>) {
  const { size, ...restProps } = props;

  return {
    ...restProps,
    width: getSVGSize(size),
    height: getSVGSize(size),
  };
}

interface IIconWrapperProps {
  pad?: TEdgeSize;
  margin?: TEdgeSize;
  hoverColor?: string;
  activeColor?: string;
  onClick: React.EventHandler<React.MouseEvent<HTMLDivElement>>;
}

const Wrapper = styled.div<IIconWrapperProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.onClick instanceof Function ? 'pointer' : 'auto')};

  svg {
    color: ${props => (props.color ? getThemeColor(props.color, props.theme) : 'inherit')};

    :hover {
      ${props => props.hoverColor && `color: ${getThemeColor(props.hoverColor, props.theme)}`}
    }

    :active {
      ${props => props.activeColor && `color: ${getThemeColor(props.activeColor, props.theme)}`}
    }
  }

  ${props => props.pad && getPaddingCSS(props.pad, props.theme)}
  ${props => props.margin && getMarginCSS(props.margin, props.theme)}
`;

function EmptyComponent(glyph: string) {
  return null;
}

class IconClass extends React.Component<IIconProps> {
  private ref: any;

  componentDidMount() {
    const { onClick, nativeClick } = this.props;
    if (onClick instanceof Function && nativeClick) {
      this.ref.addEventListener('click', this.onClick);
    }
  }

  componentWillUnmount() {
    const { onClick, nativeClick } = this.props;

    if (onClick instanceof Function && nativeClick) {
      this.ref.removeEventListener('click', this.onClick);
    }
  }

  render() {
    const {
      glyph,
      hover,
      tooltip = {},
      margin,
      pad,
      onClick,
      color,
      hoverColor,
      activeColor,
      theme,
      ...restProps
    } = this.props;
    const Component: IconComponentType = icons[glyph] || EmptyComponent;
    if (Component === EmptyComponent) {
      console.warn('Has no icon with glyph', glyph);
    }
    const className = cn(this.props.className, hover ? styles.hoverIcon : '');

    if (tooltip.text) {
      return (
        <Tooltip {...tooltip}>
          <Wrapper
            ref={ref => (this.ref = ref)}
            color={color}
            hoverColor={hoverColor}
            activeColor={activeColor}
            margin={margin}
            pad={pad}
            onClick={this.onClick}
          >
            <Component {...convertToSVGProps(restProps)} className={className} />
          </Wrapper>
        </Tooltip>
      );
    }

    return (
      <Wrapper
        ref={ref => (this.ref = ref)}
        color={color}
        hoverColor={hoverColor}
        activeColor={activeColor}
        margin={margin}
        pad={pad}
        onClick={this.onClick}
      >
        <Component {...convertToSVGProps(restProps)} className={className} />
      </Wrapper>
    );
  }

  onClick: React.EventHandler<React.MouseEvent<HTMLDivElement>> = evt => {
    const { stopPropagation } = this.props;
    if (stopPropagation) {
      evt.stopPropagation();
    }

    if (this.props.onClick instanceof Function) {
      this.props.onClick();
      evt.preventDefault();
    }
  };
}

// @ts-ignore
export const Icon: React.ComponentType<IIconProps> = withTheme(IconClass);
Icon.displayName = 'Icon';

export { icons };

type IconComponentType = React.ComponentType<React.SVGProps<SVGSVGElement>>;
