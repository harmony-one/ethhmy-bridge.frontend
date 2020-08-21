import { PureComponent, ReactNode } from 'react';

export class Default extends PureComponent {
  public static isDefault(item: any): item is Default {
    return item && item.type && item.type === Default;
  }

  public render(): ReactNode {
    return this.props.children;
  }
}
