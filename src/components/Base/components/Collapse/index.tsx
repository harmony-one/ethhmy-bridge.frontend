import cn from 'classnames';
import * as React from 'react';
import { Icon } from '../Icons';
import { Row } from '../Layout';

import styles from './styles.styl';

interface ICollapseProps {
  header: string | React.ReactNode;
  isCollapsed?: boolean;
  bordered?: boolean;
  beforeOpen?(): void;
  beforeCollapse?(): void;
  style?: React.CSSProperties;
}

interface ICollapseState {
  isCollapsed: boolean;
}

export class Collapse extends React.Component<ICollapseProps, ICollapseState> {
  static readonly defaultProps = {
    isCollapsed: false,
  };

  state = {
    isCollapsed: this.props.isCollapsed,
  };

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<ICollapseProps>, nextContext: any): void {
    if (nextProps.isCollapsed !== this.state.isCollapsed) {
      this.setState({ isCollapsed: nextProps.isCollapsed });
    }
  }

  render() {
    const { header, bordered, children, style } = this.props;
    const { isCollapsed } = this.state;

    const className = cn(styles.collapse, {
      [styles.collapseBordered]: bordered,
    });

    return (
      <div className={className} style={style}>
        <div onClick={this.toggle} style={{ cursor: 'pointer' }}>
          <Row ai={'center'} jc={'center'}>
            {isCollapsed ? (
              <Icon glyph="ArrowDown" size="small" color={'black'} />
            ) : (
              <Icon glyph="ArrowUp" size="small" color={'black'} />
            )}
            <Row style={{ width: '100%', marginLeft: '10px' }} ai="center">
              <div className={styles.collapseHeader}>{header}</div>
            </Row>
          </Row>
        </div>

        {isCollapsed ? null : children}
      </div>
    );
  }

  private toggle = (): void => {
    const { beforeOpen, beforeCollapse } = this.props;

    if (!this.state.isCollapsed && beforeCollapse instanceof Function) {
      beforeCollapse();
    }

    if (this.state.isCollapsed && beforeOpen instanceof Function) {
      beforeOpen();
    }

    this.setState({ isCollapsed: !this.state.isCollapsed });
  };
}
