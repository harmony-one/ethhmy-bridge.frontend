import React, { Children, PureComponent } from 'react';
import { Case } from './Case';
import { Default } from './Default';

export class Switch extends PureComponent<IProps> {
  public render(): React.ReactNode {
    const caseList: Array<React.ReactNode> = [];
    const defaultList: Array<React.ReactNode> = [];

    Children.forEach(this.props.children, item => {
      if (Case.isCase(item) && item.props.value === this.props.condition) {
        caseList.push(item);
      } else if (Default.isDefault(item)) {
        defaultList.push(item);
      }
    });

    return caseList.length ? caseList : defaultList;
  }
}

interface IProps {
  condition: string | number | boolean;
}
