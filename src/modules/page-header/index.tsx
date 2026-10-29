import type { TestIdProps } from '../../components/common/testing';
import type { ComponentProps, ReactNode } from 'react';
import { type SlotClasses, cn, partTestId } from '../../components/common';

export type PageHeaderProps = (Omit<ComponentProps<'div'>, 'title'> & {
  breadcrumb?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  classNames?: SlotClasses<
    'root' | 'breadcrumb' | 'content' | 'eyebrow' | 'title' | 'description' | 'actions'
  >;
}) &
  TestIdProps;

export function PageHeader({
  breadcrumb,
  eyebrow,
  title,
  description,
  action,
  className,
  classNames,
  'data-testid': testId,
  ...props
}: PageHeaderProps) {
  return (
    <div
      {...props}
      data-testid={testId}
      className={cn(
        'mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end',
        classNames?.root,
        className,
      )}
    >
      <div data-testid={partTestId(testId, 'content')} className={classNames?.content}>
        {breadcrumb != null && (
          <div
            data-testid={partTestId(testId, 'breadcrumb')}
            className={cn('mb-5', classNames?.breadcrumb)}
          >
            {breadcrumb}
          </div>
        )}
        {eyebrow != null && (
          <p
            data-testid={partTestId(testId, 'eyebrow')}
            className={cn(
              'mb-5 text-eyebrow font-semibold uppercase text-muted',
              classNames?.eyebrow,
            )}
          >
            {eyebrow}
          </p>
        )}
        <h1
          data-testid={partTestId(testId, 'title')}
          className={cn(
            'max-w-3xl text-display font-semibold text-ink',
            classNames?.title,
          )}
        >
          {title}
        </h1>
        {description != null && (
          <p
            data-testid={partTestId(testId, 'description')}
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
        <div
          data-testid={partTestId(testId, 'actions')}
          className={cn('shrink-0', classNames?.actions)}
        >
          {action}
        </div>
      )}
    </div>
  );
}
