import type { ComponentProps } from 'react';
import { cn, partTestId, type SlotClasses, type TestIdProps } from '../common';
import { focusRingClassName } from '../common/focus-ring';

export type DividerClassNames = SlotClasses<'root' | 'line' | 'label'>;
export type DividerProps = ComponentProps<'div'> &
  TestIdProps & {
    orientation?: 'horizontal' | 'vertical';
    variant?: 'solid' | 'dashed' | 'dotted';
    labelPosition?: 'start' | 'center' | 'end';
    /** Decorative dividers, including their labels, are hidden from assistive technology. */
    decorative?: boolean;
    classNames?: DividerClassNames;
  };

/** Separates content with an optional label between two lines. */
export function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  labelPosition = 'center',
  decorative = true,
  children,
  className,
  classNames,
  'data-testid': testId,
  ...props
}: DividerProps) {
  const vertical = orientation === 'vertical';
  const hasLabel =
    children !== undefined && children !== null && typeof children !== 'boolean';
  const lineClassName = cn(
    'min-h-0 min-w-0 flex-1 border-line',
    vertical ? 'w-0 border-s' : 'h-0 border-t',
    { solid: 'border-solid', dashed: 'border-dashed', dotted: 'border-dotted' }[
      variant
    ],
  );

  return (
    <div
      {...props}
      data-testid={testId}
      role={decorative ? 'none' : 'separator'}
      aria-hidden={decorative ? true : undefined}
      aria-orientation={decorative ? undefined : orientation}
      data-orientation={orientation}
      className={cn(
        'flex items-center',
        vertical ? 'w-fit flex-col self-stretch' : 'w-full',
        hasLabel && 'gap-3',
        focusRingClassName,
        classNames?.root,
        className,
      )}
    >
      <span
        aria-hidden="true"
        data-testid={partTestId(testId, 'line', 'start')}
        className={cn(
          lineClassName,
          hasLabel && labelPosition === 'start' && 'flex-none basis-4',
          classNames?.line,
        )}
      />
      {hasLabel && (
        <>
          <span
            data-testid={partTestId(testId, 'label')}
            className={cn('shrink-0 text-ui-sm text-muted', classNames?.label)}
          >
            {children}
          </span>
          <span
            aria-hidden="true"
            data-testid={partTestId(testId, 'line', 'end')}
            className={cn(
              lineClassName,
              labelPosition === 'end' && 'flex-none basis-4',
              classNames?.line,
            )}
          />
        </>
      )}
    </div>
  );
}
