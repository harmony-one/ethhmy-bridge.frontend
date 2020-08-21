import * as React from 'react';

export const CheckBoxEmpty = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 18 18" {...props}>
    <rect
      width="16"
      height="16"
      x="1"
      y="1"
      fill="#F5F7FC"
      fillRule="evenodd"
      stroke="currentColor"
      strokeWidth="2"
      rx="4"
    />
  </svg>
);
