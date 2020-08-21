import * as React from 'react';

export const SendArrow = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="512"
    height="512"
    viewBox="0 0 512 512"
    {...props}
  >
    <linearGradient
      id="a"
      x1="302.67"
      x2="302.67"
      y1="34"
      y2="483.782"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0" stopColor="#00efd1"></stop>
      <stop offset="1" stopColor="#00acea"></stop>
    </linearGradient>
    <linearGradient
      id="b"
      x1="156.834"
      x2="156.834"
      y1="34"
      y2="483.782"
      xlinkHref="#a"
    ></linearGradient>
    <linearGradient
      id="c"
      x1="125.724"
      x2="125.724"
      y1="34"
      y2="483.782"
      xlinkHref="#a"
    ></linearGradient>
    <linearGradient
      id="d"
      x1="94.613"
      x2="94.613"
      y1="34"
      y2="483.782"
      xlinkHref="#a"
    ></linearGradient>
    <path
      fill="url(#a)"
      d="M327.955 150.481a9.874 9.874 0 00-16.955 7V205H187.972a9.8 9.8 0 00-10 9.753l-.053 82.842a9.315 9.315 0 002.927 6.774 9.729 9.729 0 007.073 2.631H311v47.517a9.915 9.915 0 006.126 9.257 9.738 9.738 0 003.733.744 9.95 9.95 0 007.12-3L424.565 263a10 10 0 000-14zM331 330.035v-32.554c0-5.523-4.663-10.481-10.186-10.481H197.926l.04-62h122.848c5.523 0 10.186-4.958 10.186-10.481v-32.554L403.594 256z"
    ></path>
    <path
      fill="url(#b)"
      d="M156.866 205h-.006a9.8 9.8 0 00-10 9.753l-.051 82.6A9.7 9.7 0 00156.8 307h.006a9.8 9.8 0 0010-9.753l.051-82.6a9.7 9.7 0 00-9.991-9.647z"
    ></path>
    <path
      fill="url(#c)"
      d="M125.756 205h-.006a9.8 9.8 0 00-10 9.753l-.052 82.6a9.7 9.7 0 009.994 9.647h.006a9.8 9.8 0 0010-9.753l.052-82.6a9.7 9.7 0 00-9.994-9.647z"
    ></path>
    <path
      fill="url(#d)"
      d="M94.645 205h-.006a9.8 9.8 0 00-10 9.753l-.052 82.6A9.7 9.7 0 0094.581 307h.006a9.8 9.8 0 0010-9.753l.052-82.6A9.7 9.7 0 0094.645 205z"
    ></path>
  </svg>
);
