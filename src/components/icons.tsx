import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.5 5.162a1 1 0 0 0-1 0L2.598 9.084a1 1 0 0 0 0 1.838l9.403 3.918a1 1 0 0 0 .998 0l8.428-3.918Z" />
      <path d="M4 12.016v4.375c0 1.638 3.582 3.11 8 3.11s8-1.472 8-3.11V12.016" />
    </svg>
  );
}
