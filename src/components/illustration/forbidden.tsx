import type { SVGProps } from 'react';
import { cn } from '../common';

export function ForbiddenIllustration({
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
        x="54"
        y="25"
        width="132"
        height="116"
        rx="10"
        fill="var(--color-surface)"
      />
      <path d="M72 44h96M72 56h53" stroke="var(--color-line)" strokeWidth="3" />
      <path
        d="M98 91V76a22 22 0 0 1 44 0v15"
        stroke="var(--color-brand-700)"
        strokeWidth="5"
      />
      <rect
        x="84"
        y="87"
        width="72"
        height="55"
        rx="9"
        fill="var(--color-brand-100)"
        stroke="var(--color-brand-700)"
      />
      <circle cx="120" cy="109" r="5" fill="var(--color-brand-700)" stroke="none" />
      <path d="M120 113v10" stroke="var(--color-brand-700)" strokeWidth="4" />
    </svg>
  );
}
