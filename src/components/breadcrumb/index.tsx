'use client';

import { Fragment, type ComponentProps } from 'react';
import { useUILocale } from '../../i18n/provider';
import { cn, partTestId } from '../common';
import { BreadcrumbLink, breadcrumbLinkClasses } from './link';
import type { BreadcrumbItemData, BreadcrumbProps } from './types';

export type { BreadcrumbProps, BreadcrumbItemData } from './types';

const variantClasses = {
  page: { muted: 'text-muted', current: 'text-ink', hover: 'hover:text-ink' },
  hero: {
    muted: 'text-on-brand/70',
    current: 'text-on-brand',
    hover: 'hover:text-on-brand',
  },
};

function BreadcrumbEntry({
  item,
  isCurrent,
  variant,
  classNames,
  testId,
}: {
  item: BreadcrumbItemData;
  isCurrent: boolean;
  variant: NonNullable<BreadcrumbProps['variant']>;
  classNames: BreadcrumbProps['classNames'];
  testId: string | undefined;
}) {
  const colors = variantClasses[variant];
  const interactive = !isCurrent && Boolean(item.href || item.onClick);
  const className = cn(
    interactive && breadcrumbLinkClasses,
    interactive && 'outline-none',
    isCurrent ? colors.current : colors.muted,
    interactive && colors.hover,
    isCurrent && classNames?.current,
    interactive && classNames?.link,
    item.className,
  );

  if (isCurrent)
    return (
      <BreadcrumbPage
        className={className}
        data-testid={partTestId(testId, 'current', item.key)}
      >
        {item.title}
      </BreadcrumbPage>
    );
  if (item.href)
    return (
      <BreadcrumbLink
        href={item.href}
        onClick={item.onClick}
        className={className}
        data-testid={partTestId(testId, 'link', item.key)}
      >
        {item.title}
      </BreadcrumbLink>
    );
  if (item.onClick)
    return (
      <button
        type="button"
        onClick={item.onClick}
        className={className}
        data-testid={partTestId(testId, 'action', item.key)}
      >
        {item.title}
      </button>
    );

  return <span className={className}>{item.title}</span>;
}

export function Breadcrumb({
  className,
  classNames,
  items,
  description,
  separator = '/',
  variant = 'page',
  children,
  'data-testid': testId,
  'aria-label': label,
  ...props
}: BreadcrumbProps) {
  const { t } = useUILocale();
  if (items && items.length === 0) return null;
  const colors = variantClasses[variant];

  return (
    <nav
      {...props}
      aria-label={label ?? t('breadcrumb.label')}
      data-testid={testId}
      className={cn('min-w-0 text-ui-sm', colors.muted, classNames?.root, className)}
    >
      {items ? (
        <BreadcrumbList
          className={classNames?.list}
          data-testid={partTestId(testId, 'list')}
        >
          {items.map((item, index) => (
            <Fragment key={item.key}>
              {index > 0 && (
                <BreadcrumbSeparator
                  className={cn(colors.muted, classNames?.separator)}
                  data-testid={partTestId(testId, 'separator', item.key)}
                >
                  {separator}
                </BreadcrumbSeparator>
              )}
              <BreadcrumbItem
                className={classNames?.item}
                data-testid={partTestId(testId, 'item', item.key)}
              >
                <BreadcrumbEntry
                  item={item}
                  isCurrent={index === items.length - 1}
                  variant={variant}
                  classNames={classNames}
                  testId={testId}
                />
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      ) : (
        children
      )}
      {description != null && (
        <p
          className={cn('mt-1 text-ui-sm', colors.muted, classNames?.description)}
          data-testid={partTestId(testId, 'description')}
        >
          {description}
        </p>
      )}
    </nav>
  );
}

export function BreadcrumbList({ className, ...props }: ComponentProps<'ol'>) {
  return (
    <ol
      {...props}
      className={cn(
        'm-0 flex min-w-0 list-none flex-wrap items-center gap-x-2 gap-y-1 p-0',
        className,
      )}
    />
  );
}

export function BreadcrumbItem({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li {...props} className={cn('min-w-0 [overflow-wrap:anywhere]', className)} />
  );
}

export { BreadcrumbLink } from './link';

export function BreadcrumbPage({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      {...props}
      aria-current="page"
      className={cn('font-medium text-ink', className)}
    />
  );
}

export function BreadcrumbSeparator({
  className,
  children = '/',
  ...props
}: ComponentProps<'li'>) {
  return (
    <li
      {...props}
      role="presentation"
      aria-hidden="true"
      className={cn('shrink-0 select-none text-muted', className)}
    >
      {children}
    </li>
  );
}
