import type { SVGProps } from 'react';
import { cn } from '../common';

export function EmptyIllustration({ className, ...props }: SVGProps<SVGSVGElement>) {
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
      <path
        d="M47 79V48a8 8 0 0 1 8-8h42l13 13h68a8 8 0 0 1 8 8v18"
        fill="var(--color-brand-100)"
      />
      <rect
        x="75"
        y="24"
        width="87"
        height="96"
        rx="7"
        fill="var(--color-surface)"
        transform="rotate(7 118 72)"
      />
      <path
        d="M91 49h47M89 63h53M87 77h37"
        stroke="var(--color-line)"
        strokeWidth="3"
      />
      <path
        d="M36 80a7 7 0 0 1 7-8h53l11 13h87a7 7 0 0 1 7 8l-8 40a8 8 0 0 1-8 7H54a8 8 0 0 1-8-7Z"
        fill="var(--color-brand-50)"
      />
      <path d="M104 112h30" stroke="var(--color-brand-700)" strokeWidth="3" />
    </svg>
  );
}
