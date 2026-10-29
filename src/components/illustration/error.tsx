import type { SVGProps } from 'react';
import { cn } from '../common';

export function ErrorIllustration({ className, ...props }: SVGProps<SVGSVGElement>) {
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
      <rect x="45" y="30" width="142" height="40" rx="8" fill="var(--color-surface)" />
      <rect x="45" y="80" width="142" height="40" rx="8" fill="var(--color-surface)" />
      <path d="M61 50h58M61 100h38" stroke="var(--color-line)" strokeWidth="4" />
      <circle cx="170" cy="50" r="4" fill="var(--color-brand-100)" stroke="none" />
      <path
        d="m156 85-30 49a6 6 0 0 0 5 9h59a6 6 0 0 0 5-9l-29-49a6 6 0 0 0-10 0Z"
        fill="var(--color-danger-50)"
        stroke="var(--color-danger-700)"
      />
      <path d="M161 104v15" stroke="var(--color-danger-700)" strokeWidth="2" />
      <circle cx="161" cy="130" r="1.5" fill="var(--color-danger-700)" stroke="none" />
    </svg>
  );
}
