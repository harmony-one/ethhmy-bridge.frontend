import React from 'react';
import * as s from './HeaderTab.styl';
import cn from 'classnames';
import { NavLink } from 'react-router-dom';

interface Props {
  title: string;
  to: string;
}

export const HeaderTab: React.FC<Props> = ({ title, to }) => {
  const classes = cn(s.root);

  return (
    <NavLink to={to} activeClassName={s.active} className={classes}>
      {title}
    </NavLink>
  );
};

HeaderTab.displayName = 'HeaderTab';
