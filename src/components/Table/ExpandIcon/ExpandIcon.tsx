import React from 'react';
import { RenderExpandIconProps } from 'rc-table/es/interface';

export const Expand = (props: React.HTMLProps<SVGSVGElement>) => (
  <svg
    onClick={props.onClick}
    width="9"
    height="9"
    viewBox="0 0 9 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="0.25"
      y="3.08472"
      width="8.5"
      height="2.83333"
      rx="1.41667"
      fill="#C4C4C4"
    />
    <rect
      x="5.91748"
      y="0.25"
      width="8.5"
      height="2.83333"
      rx="1.41667"
      transform="rotate(90 5.91748 0.25)"
      fill="#C4C4C4"
    />
  </svg>
);

export const Collapse = (props: React.HTMLProps<SVGSVGElement>) => (
  <svg
    onClick={props.onClick}
    width="9"
    height="9"
    viewBox="0 0 9 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="0.25"
      y="3.08472"
      width="8.5"
      height="2.83333"
      rx="1.41667"
      fill="#C4C4C4"
    />
  </svg>
);

export const ExpandIcon = ({
  expanded,
  onExpand,
  record,
}: RenderExpandIconProps<unknown>) => {
  if (!expanded) {
    return (
      <Expand
        // @ts-ignore
        onClick={(e: React.MouseEvent<HTMLElement>) => {
          onExpand(record, e);
        }}
      />
    );
  }

  return (
    <Collapse
      // @ts-ignore
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        onExpand(record, e);
      }}
    />
  );
};

ExpandIcon.displayName = 'ExpandIcon';
