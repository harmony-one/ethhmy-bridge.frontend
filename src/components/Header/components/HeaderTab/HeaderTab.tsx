import React from 'react';
import * as s from './HeaderTab.styl';
import cn from 'classnames';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

interface Props {
  title: string;
  to: string;
  external?: boolean;
}

const StyledLink = styled.a`
  color: ${props => props.theme.headerTab.color};
  font-size: 14px;
  font-weight: bold;
  padding: 12px 12px;
  text-decoration: none;
`;

const StyledNavLink = styled(NavLink)`
  color: ${props => props.theme.headerTab.color};
  font-size: 14px;
  font-weight: bold;
  padding: 12px 12px;
  text-decoration: none;
`;

export const HeaderTab: React.FC<Props> = ({ title, to, external }) => {
  if (external) {
    return (
      <StyledLink href={to} target="_blank" rel="noreferrer">
        {title}
      </StyledLink>
    );
  }

  return (
    <StyledNavLink to={to} activeClassName={s.active}>
      {title}
    </StyledNavLink>
  );
};

HeaderTab.displayName = 'HeaderTab';
