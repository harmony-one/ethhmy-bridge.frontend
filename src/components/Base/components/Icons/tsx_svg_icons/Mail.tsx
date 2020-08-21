import * as React from 'react';

export const Mail: React.FC<React.SVGProps<SVGSVGElement>> = ({ ...svgProps }) => (
  <svg
    width="12"
    height="9"
    viewBox="0 0 12 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...svgProps}
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M0 0.689914C0 0.308885 0.293943 0 0.656541 0H11.3434C11.706 0 11.9999 0.308885 11.9999 0.689914V8.31009C11.9999 8.69112 11.706 9 11.3434 9H0.656541C0.293943 9 0 8.69112 0 8.31009V0.689914ZM1.31308 1.37983V7.62017H10.6868V1.37983H1.31308Z"
      fill="currentColor"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M0.037638 0.459783C0.130426 0.184213 0.378405 0 0.656577 0H11.3434C11.6222 0 11.8706 0.185026 11.9629 0.461465C12.0552 0.737903 11.9713 1.04546 11.7537 1.22854L6.382 5.74669C6.14117 5.94925 5.79864 5.94832 5.55882 5.74446L0.243665 1.2263C0.0273948 1.04246 -0.0551502 0.735353 0.037638 0.459783ZM2.51211 1.37983L5.97391 4.32254L9.47253 1.37983H2.51211Z"
      fill="currentColor"
    />
  </svg>
);
