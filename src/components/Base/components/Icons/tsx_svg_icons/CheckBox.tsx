import * as React from 'react';

export const CheckBox = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 18 18" {...props}>
    <g fill="none" fillRule="evenodd">
      <rect width="100%" height="100%" fill="currentColor" rx="4" />
      <path
        stroke="#FFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13 6l-5.5 5.5L5 9"
      />
    </g>
  </svg>
);
