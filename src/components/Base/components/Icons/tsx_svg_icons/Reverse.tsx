import * as React from 'react';

export const Reverse = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="67" height="69" viewBox="0 0 67 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_dd)">
      <rect x="2.5" y="0.5" width="62" height="62" rx="31" fill="white" />
      <g clip-path="url(#clip0)">
        <path d="M21.2369 33.2221C20.2704 33.2221 19.4869 34.0056 19.4869 34.9721C19.4869 35.5975 19.815 36.1463 20.3085 36.4557L25.0118 41.1591C25.6953 41.8425 26.8033 41.8425 27.4867 41.1591C28.1701 40.4757 28.1701 39.3676 27.4867 38.6842L25.5246 36.7221H38.7369C39.7034 36.7221 40.4869 35.9386 40.4869 34.9721C40.4869 34.0056 39.7034 33.2221 38.7369 33.2221L21.3235 33.2221C21.3075 33.2218 21.2915 33.2218 21.2756 33.2221H21.2369Z" fill="#212D5E" />
        <path d="M45.763 29.7777C46.7295 29.7777 47.513 28.9942 47.513 28.0277C47.513 27.4023 47.1849 26.8535 46.6914 26.544L41.9881 21.8407C41.3047 21.1573 40.1966 21.1573 39.5132 21.8407C38.8298 22.5241 38.8298 23.6321 39.5132 24.3156L41.4754 26.2777L28.263 26.2777C27.2965 26.2777 26.513 27.0612 26.513 28.0277C26.513 28.9942 27.2965 29.7777 28.263 29.7777L45.6765 29.7777C45.6924 29.7779 45.7084 29.7779 45.7244 29.7777H45.763Z" fill="#212D5E" />
      </g>
      <rect x="3" y="1" width="61" height="61" rx="30.5" stroke="#DEDEDE" />
    </g>
    <defs>
      <filter id="filter0_dd" x="0.5" y="0.5" width="66" height="68" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
        <feMorphology radius="2" operator="erode" in="SourceAlpha" result="effect1_dropShadow" />
        <feOffset dy="4" />
        <feGaussianBlur stdDeviation="2" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.0941176 0 0 0 0 0.152941 0 0 0 0 0.294118 0 0 0 0.08 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
        <feMorphology radius="2" operator="erode" in="SourceAlpha" result="effect2_dropShadow" />
        <feOffset dy="2" />
        <feGaussianBlur stdDeviation="2" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.0941176 0 0 0 0 0.152941 0 0 0 0 0.294118 0 0 0 0.12 0" />
        <feBlend mode="normal" in2="effect1_dropShadow" result="effect2_dropShadow" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow" result="shape" />
      </filter>
      <clipPath id="clip0">
        <path d="M12.5 22.5C12.5 15.8726 17.8726 10.5 24.5 10.5H42.5C49.1274 10.5 54.5 15.8726 54.5 22.5V40.5C54.5 47.1274 49.1274 52.5 42.5 52.5H24.5C17.8726 52.5 12.5 47.1274 12.5 40.5V22.5Z" fill="white" />
      </clipPath>
    </defs>
  </svg>

);
