import type { TestIdProps } from '../common/testing';
import type { ComponentProps, ReactNode } from 'react';
import { type SlotClasses, cn } from '../common';

export type CardProps = (Omit<ComponentProps<'section'>, 'title'> & {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  contentClassName?: string;
  classNames?: SlotClasses<
    'root' | 'header' | 'heading' | 'title' | 'description' | 'content' | 'footer'
  >;
}) &
  TestIdProps;

export function Card({
  title,
  description,
  action,
  footer,
  className,
  classNames,
  contentClassName,
  children,
  ...props
}: CardProps) {
  return (
    <section
      {...props}
      className={cn(
        'min-w-0 rounded-panel border border-line bg-surface p-6 shadow-panel',
        classNames?.root,
        className,
      )}
    >
      {(title != null || description != null || action != null) && (
        <div
          className={cn(
            'mb-5 flex items-start justify-between gap-4',
            classNames?.header,
          )}
        >
          <div className={classNames?.heading}>
            {title != null && (
              <h2
                className={cn(
                  'text-section leading-7 font-semibold text-ink',
                  classNames?.title,
                )}
              >
                {title}
              </h2>
            )}
            {description != null && (
              <p className={cn('mt-1 text-ui-sm text-muted', classNames?.description)}>
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      <div
        className={cn(
          'text-ui-sm leading-relaxed text-muted',
          classNames?.content,
          contentClassName,
        )}
      >
        {children}
      </div>
      {footer != null && (
        <div
          className={cn(
            'mt-5 border-t border-line pt-4 text-ui-sm text-muted',
            classNames?.footer,
          )}
        >
          {footer}
        </div>
      )}
    </section>
  );
}
