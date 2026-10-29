import type { SVGProps } from 'react';
import { cn } from '../common';

export function NoResultsIllustration({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
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
        x="45"
        y="26"
        width="140"
        height="110"
        rx="10"
        fill="var(--color-surface)"
      />
      <path d="M45 55h140" stroke="var(--color-line)" />
      <circle cx="60" cy="41" r="3" fill="var(--color-brand-100)" stroke="none" />
      <path
        d="M73 41h58M64 77h71M64 92h51M64 107h30"
        stroke="var(--color-line)"
        strokeWidth="4"
      />
      <circle
        cx="157"
        cy="100"
        r="30"
        fill="var(--color-brand-50)"
        stroke="var(--color-brand-700)"
        strokeWidth="2"
      />
      <path d="m179 122 21 21" stroke="var(--color-brand-700)" strokeWidth="9" />
      <path d="m147 100h20" stroke="var(--color-brand-700)" strokeWidth="2" />
    </svg>
  );
}
