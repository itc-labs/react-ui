import type { TestIdProps } from '../../components/common/testing';
import type { ComponentProps, ReactNode } from 'react';
import { type SlotClasses, cn } from '../../components/common';

export type PageHeaderProps = (Omit<ComponentProps<'div'>, 'title'> & {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  classNames?: SlotClasses<
    'root' | 'content' | 'eyebrow' | 'title' | 'description' | 'actions'
  >;
}) &
  TestIdProps;

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
  classNames,
  ...props
}: PageHeaderProps) {
  return (
    <div
      {...props}
      className={cn(
        'mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end',
        classNames?.root,
        className,
      )}
    >
      <div className={classNames?.content}>
        {eyebrow != null && (
          <p
            className={cn(
              'mb-5 text-eyebrow font-semibold uppercase text-muted',
              classNames?.eyebrow,
            )}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            'max-w-3xl text-display font-semibold text-ink',
            classNames?.title,
          )}
        >
          {title}
        </h1>
        {description != null && (
          <p
            className={cn(
              'mt-6 max-w-2xl text-control leading-relaxed text-muted',
              classNames?.description,
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action != null && (
        <div className={cn('shrink-0', classNames?.actions)}>{action}</div>
      )}
    </div>
  );
}
