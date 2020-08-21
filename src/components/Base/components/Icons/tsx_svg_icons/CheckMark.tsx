import * as React from 'react';

export const CheckMark = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path fill="none" stroke="currentColor" strokeWidth="2" d="M6 13 10.2 16.6 18 7" />
  </svg>
);
