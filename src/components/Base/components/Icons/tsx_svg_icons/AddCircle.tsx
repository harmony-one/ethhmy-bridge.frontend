import * as React from 'react';

export const AddCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    transform="rotate(-45)"
    {...props}
  >
    <circle cx="7.5" cy="7.5" r="7.5" fill="white" />
    <rect
      x="5.73157"
      y="3.96521"
      width="7.5"
      height="2.5"
      rx="1.25"
      transform="rotate(45 5.73157 3.96521)"
      fill="#1B1B1C"
    />
    <rect
      x="11.0356"
      y="5.7323"
      width="7.5"
      height="2.5"
      rx="1.25"
      transform="rotate(135 11.0356 5.7323)"
      fill="#1B1B1C"
    />
  </svg>
);
