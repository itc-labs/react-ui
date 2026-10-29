import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const merge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ['control-sm', 'control-md', 'control-lg'],
      container: [
        'dialog',
        'drawer',
        'popover',
        'sidebar',
        'sidebar-collapsed',
        'workspace',
      ],
      text: [
        'heading',
        'title',
        'section',
        'body',
        'control',
        'ui-sm',
        'display',
        'eyebrow',
      ],
      radius: ['control', 'panel'],
      shadow: ['panel', 'floating', 'overlay', 'control-focus', 'control-error'],
    },
  },
});

/** Consumers can override default utilities, including our semantic theme tokens. */
export function cn(...values: ClassValue[]) {
  return merge(clsx(values));
}

export type ControlSize = 'sm' | 'md' | 'lg';
export const clearIndicatorClassName =
  'rounded p-0.5 text-muted hover:bg-hover-strong hover:text-ink';
export const controlSizes: Record<ControlSize, string> = {
  sm: 'h-control-sm px-2.5 text-ui-sm',
  md: 'h-control-md px-3 text-control',
  lg: 'h-control-lg px-4 text-control',
};
export const controlBase =
  'w-full rounded-control border border-control-border bg-surface text-ink placeholder:text-muted outline-none motion-safe:transition-[border-color,box-shadow,background-color] duration-[var(--motion-duration-control)] focus:border-accent focus:shadow-control-focus aria-invalid:border-danger-700 aria-invalid:focus:border-danger-700 aria-invalid:focus:shadow-control-error forced-colors:focus:outline-2 forced-colors:focus:outline-solid forced-colors:focus:outline-[Highlight] disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-60';

export function fieldDescription(
  id: string,
  hasError: boolean,
  hasHint: boolean,
  existing?: string,
) {
  return (
    [existing, hasError ? `${id}-error` : hasHint ? `${id}-hint` : undefined]
      .filter(Boolean)
      .join(' ') || undefined
  );
}

/** Typed styling slots. Values are merged after defaults with cn(). */
export type SlotClasses<Slot extends string> = Partial<Record<Slot, string>>;
export type FieldClassNames = SlotClasses<
  'root' | 'label' | 'required' | 'control' | 'hint' | 'error'
>;

export { partTestId, type TestIdProps } from './testing';
