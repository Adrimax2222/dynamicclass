import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="500"
      height="500"
      viewBox="0 0 500 500"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_401_80)">
        <path
          d="M250 500C388.071 500 500 388.071 500 250C500 111.929 388.071 0 250 0C111.929 0 0 111.929 0 250C0 388.071 111.929 500 250 500Z"
          fill="url(#paint0_linear_401_80)"
        ></path>
        <path
          d="M250 464.286C368.512 464.286 464.286 368.512 464.286 250C464.286 131.488 368.512 35.7144 250 35.7144C131.488 35.7144 35.7144 131.488 35.7144 250C35.7144 368.512 131.488 464.286 250 464.286Z"
          stroke="#F1F1F1"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
        <path
          d="M178.571 160.714H321.429L267.857 250L321.429 339.286H178.571L232.143 250L178.571 160.714Z"
          stroke="#F1F1F1"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_401_80"
          x1="250"
          y1="0"
          x2="250"
          y2="500"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2962FF"></stop>
          <stop offset="1" stopColor="#7C4DFF"></stop>
        </linearGradient>
        <clipPath id="clip0_401_80">
          <rect width="500" height="500" fill="white"></rect>
        </clipPath>
      </defs>
    </svg>
  );
}
