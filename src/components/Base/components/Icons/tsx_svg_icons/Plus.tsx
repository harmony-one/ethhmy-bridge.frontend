import * as React from 'react';

export const Plus = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 12 12" {...props}>
    <g fill="none" fillRule="evenodd">
      <path fill="#D8D8D8" d="M9 6v6" />
      <path
        fill="currentColor"
        d="M6 0a1 1 0 0 1 1 1v4h4a1 1 0 0 1 0 2H7v4a1 1 0 0 1-2 0V6.999L1 7a1 1 0 1 1 0-2l4-.001V1a1 1 0 0 1 1-1z"
      />
    </g>
  </svg>
);
