import { createGlobalStyle } from 'styled-components';
import { transparentize } from 'polished';

export const GlobalStyle = createGlobalStyle<any>`
  html {
    color: ${props => props.theme.colorSecondary};
    background-color: ${props => transparentize(0.9, props.theme.palette.Basic700)};
  }
  
  body {
    font-family: ${props => props.theme.fontBase || 'Nunito'};
    overflow-x: hidden;
    background-position: 0 100%;
    background-repeat: no-repeat;
    background-image: ${props =>
      `radial-gradient(50% 50% at 50% 50%, ${transparentize(0.4, props.theme.colorSecondary)} 0%, ${transparentize(
        0.9,
        props.theme.palette.Basic700,
      )} 100%)`};
  }
`;
