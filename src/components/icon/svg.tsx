import type { TestIdProps } from '../common/testing';
import type { SVGProps } from 'react';
import { cn } from '../common';

export type IconSvgProps = (SVGProps<SVGSVGElement> & {
  size?: number;
  label?: string;
}) &
  TestIdProps;

/** Shared SVG contract for direct imports; independent of UIProvider. */
export function IconSvg({
  size,
  width,
  height,
  label,
  className,
  children,
  ...props
}: IconSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size ?? width ?? 16}
      height={size ?? height ?? 16}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
      {...props}
      className={cn(className)}
    >
      {children}
    </svg>
  );
}
