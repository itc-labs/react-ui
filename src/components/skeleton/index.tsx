import type { ComponentProps } from 'react';
import { cn } from '../common';

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={cn(
        'h-4 rounded-control bg-brand-100 motion-safe:animate-pulse',
        className,
      )}
    />
  );
}
