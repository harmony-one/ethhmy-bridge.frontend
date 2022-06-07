import React from 'react';
import * as s from './HeaderTab.styl';
import cn from 'classnames';
import { NavLink, Link } from 'react-router-dom';

interface Props {
  title: string;
  to: string;
  external?: boolean;
}

export const HeaderTab: React.FC<Props> = ({ title, to, external }) => {
  const classes = cn(s.root);

  if (external) {
    return (
      <a href={to} className={classes} target="_blank" rel="noreferrer">
        {title}
      </a>
    );
  }

  return (
    <NavLink to={to} activeClassName={s.active} className={classes}>
      {title}
    </NavLink>
  );
};

HeaderTab.displayName = 'HeaderTab';
