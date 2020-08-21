import * as React from 'react';

export const CloseIcon = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={props.className}
    >
      <g fill="none" fillRule="evenodd">
        <path fill="none" d="M0 0h16v16H0z"></path>
        <path
          fill={props.fill || "#9698A7"}
          d="M3.05 1.636L8 6.586l4.95-4.95a1 1 0 111.414 1.414L9.414 8l4.95 4.95a1 1 0 11-1.414 1.414L8 9.414l-4.95 4.95a1 1 0 01-1.414-1.414L6.586 8l-4.95-4.95A1 1 0 013.05 1.636z"
        ></path>
      </g>
    </svg>
  );
};
