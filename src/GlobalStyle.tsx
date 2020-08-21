import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle<any>`
  body {
    font-family: ${props => props.theme.fontBase || 'Nunito'};
  }
  
  @-webkit-keyframes autofill {
      to {
          color: #666;
          background: transparent;
      }
  }

    input:-webkit-autofill {
        -webkit-animation-name: autofill;
        -webkit-animation-fill-mode: both;
    }
    
    .ag-header-filter-with {
      position: relative;
      
      &:before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        height: 1px;
        background-color: #e7ecf7;
        z-index: 2;
      }
    }
`;
