import * as React from 'react';
import * as Icons from './index';
import * as styles from './styles.styl';
import cn from 'classnames';

interface IIConProps {
  hover?: boolean;
  component: React.ElementType;
  [name: string]: any;
}

class Icon extends React.Component<IIConProps> {
  private ref: any;

  public componentDidMount() {
    if (this.props.onClick) {
      this.ref.addEventListener('click', this.onClick);
    }
  }

  public componentWillUnmount() {
    if (this.props.onClick) {
      this.ref.removeEventListener('click', this.onClick);
    }
  }

  public render() {
    const { hover, onClick, component: Component, ...params } = this.props;
    const className = cn(this.props.className, hover ? styles.hoverIcon : '');

    return (
      <div
        ref={(ref: any) => (this.ref = ref)}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Component {...params} className={className} />
      </div>
    );
  }

  private onClick = (evt: Event) => {
    evt.stopPropagation();
    evt.preventDefault();

    this.props.onClick();
  };
}

function convertToSVGProps(props: Partial<IIConProps>) {
  const { size, width, height, ...restProps } = props;
  return {
    ...restProps,
    width: getSVGSize(size, width),
    height: getSVGSize(size, height),
  };
}

function getSVGSize(size: string, value: string) {
  switch (size) {
    case 'small':
      return '12px';
    case 'medium':
      return '16px';
    case 'large':
      return '20px';
    case 'xlarge':
      return '24px';

    default:
      return size || value ? value : '20px';
  }
}

const customizeHOC = (Component: React.ElementType) => {
  return (props: Partial<IIConProps>) => (
    <Icon {...convertToSVGProps(props)} component={Component} />
  );
};

export const CloseIcon = customizeHOC(Icons.CloseIcon);
export const PlusIcon = customizeHOC(Icons.PlusIcon);
export const RateIcon = customizeHOC(Icons.RateIcon);
export const UnknownIcon = customizeHOC(Icons.UnknownIcon);
