import type { SVGProps } from 'react';
import { cn } from '../common';

export function NotFoundIllustration({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 240 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-auto w-full max-w-full text-control-border', className)}
      {...props}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse
        cx="120"
        cy="148"
        rx="86"
        ry="5"
        fill="var(--color-brand-100)"
        stroke="none"
      />
      <rect
        x="34"
        y="29"
        width="172"
        height="112"
        rx="10"
        fill="var(--color-surface)"
      />
      <path d="M34 54h172" stroke="var(--color-line)" />
      <circle cx="48" cy="42" r="2.5" fill="var(--color-brand-100)" stroke="none" />
      <circle cx="58" cy="42" r="2.5" fill="var(--color-brand-100)" stroke="none" />
      <circle cx="68" cy="42" r="2.5" fill="var(--color-brand-100)" stroke="none" />
      <rect
        x="93"
        y="69"
        width="54"
        height="56"
        rx="4"
        strokeDasharray="4 5"
        stroke="var(--color-line)"
      />
      <g transform="rotate(-10 109 81)">
        <path
          d="M75 15h47l20 20v70a6 6 0 0 1-6 6H81a6 6 0 0 1-6-6Z"
          fill="var(--color-brand-50)"
          stroke="var(--color-brand-700)"
        />
        <path d="M122 15v20h20" stroke="var(--color-brand-700)" />
        <path
          d="M100 57a9 9 0 1 1 15 7c-5 3-7 4-7 10"
          stroke="var(--color-brand-700)"
          strokeWidth="2"
        />
        <circle cx="108" cy="84" r="1.5" fill="var(--color-brand-700)" stroke="none" />
      </g>
    </svg>
  );
}
