import type { TestIdProps } from '../../components/common/testing';
import type { ComponentProps, ReactNode } from 'react';
import { type SlotClasses, cn } from '../../components/common';
import { Icon, type IconName } from '../../components/icon';
import { Illustration } from '../../components/illustration';
export type EmptyStateProps = (Omit<ComponentProps<'section'>, 'title'> & {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  variant?: 'empty' | 'no-results' | 'not-found' | 'error' | 'forbidden';
  classNames?: SlotClasses<
    | 'root'
    | 'illustration'
    | 'iconContainer'
    | 'icon'
    | 'code'
    | 'content'
    | 'title'
    | 'description'
    | 'actions'
  >;
  icon?: IconName;
  illustration?: ReactNode;
  code?: ReactNode;
  size?: 'compact' | 'default';
  appearance?: 'panel' | 'plain';
  headingLevel?: 1 | 2 | 3 | 4;
}) &
  TestIdProps;
const icons: Record<NonNullable<EmptyStateProps['variant']>, IconName> = {
  empty: 'folder',
  'no-results': 'search',
  'not-found': 'file',
  error: 'warning',
  forbidden: 'warning',
};

export function EmptyState({
  title,
  description,
  action,
  secondaryAction,
  variant = 'empty',
  icon,
  illustration,
  code,
  size = 'default',
  appearance = 'panel',
  headingLevel = 2,
  className,
  classNames,
  ...props
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4';

  return (
    <section
      {...props}
      className={cn(
        'flex min-w-0 flex-col items-center text-center',
        appearance === 'panel'
          ? 'rounded-panel border border-line bg-surface'
          : 'bg-transparent',
        size === 'compact' ? 'gap-3 px-5 py-8' : 'gap-5 px-6 py-12 sm:px-10',
        classNames?.root,
        className,
      )}
    >
      {illustration !== undefined ? (
        <div aria-hidden="true" className={cn('max-w-full', classNames?.illustration)}>
          {illustration}
        </div>
      ) : icon ? (
        <div
          aria-hidden="true"
          className={cn(
            'mb-1 flex size-11 shrink-0 items-center justify-center rounded-control border border-line bg-canvas',
            classNames?.iconContainer,
          )}
        >
          <Icon
            name={icon ?? icons[variant]}
            size={22}
            className={cn(
              variant === 'error' ? 'text-danger-700' : 'text-muted',
              classNames?.icon,
            )}
          />
        </div>
      ) : (
        <div
          className={cn(
            size === 'compact' ? 'w-36 max-w-full' : 'w-56 max-w-full',
            classNames?.illustration,
          )}
        >
          <Illustration name={variant} />
        </div>
      )}
      {code != null && (
        <span
          className={cn(
            'font-semibold tabular-nums tracking-tight text-muted',
            size === 'compact' ? 'text-ui-sm' : 'text-title',
            classNames?.code,
          )}
        >
          {code}
        </span>
      )}
      <div className={cn('grid min-w-0 gap-2', classNames?.content)}>
        <Heading
          className={cn(
            'break-words font-semibold text-ink',
            size === 'compact' ? 'text-body' : 'text-heading',
            classNames?.title,
          )}
        >
          {title}
        </Heading>
        {description != null && (
          <p
            className={cn(
              'max-w-md break-words text-control leading-relaxed text-muted',
              classNames?.description,
            )}
          >
            {description}
          </p>
        )}
      </div>
      {(action != null || secondaryAction != null) && (
        <div
          className={cn(
            'mt-1 flex flex-wrap items-center justify-center gap-3',
            classNames?.actions,
          )}
        >
          {action}
          {secondaryAction}
        </div>
      )}
    </section>
  );
}
