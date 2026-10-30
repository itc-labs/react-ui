'use client';

import { KitIcon } from '../../components/icon/kit-icon';
import { FirstIcon } from '../../components/icon/outline/first';
import { FirstIcon as FirstBoldIcon } from '../../components/icon/bold/first';
import { ChevronLeftIcon } from '../../components/icon/outline/chevron-left';
import { ChevronLeftIcon as ChevronLeftBoldIcon } from '../../components/icon/bold/chevron-left';
import { ChevronRightIcon } from '../../components/icon/outline/chevron-right';
import { ChevronRightIcon as ChevronRightBoldIcon } from '../../components/icon/bold/chevron-right';
import { LastIcon } from '../../components/icon/outline/last';
import { LastIcon as LastBoldIcon } from '../../components/icon/bold/last';
import type { TestIdProps } from '../../components/common/testing';

import { partTestId } from '../../components/common/testing';

import { useUILocale } from '../../i18n/provider';
import { Button } from '../../components/button';
import { type SlotClasses, cn } from '../../components/common';
import { paginationItems } from './model';
export type PaginationProps = {
  'data-testid'?: string | undefined;
  pageIndex: number;
  pageCount: number;
  onPageChange: (pageIndex: number) => void;
  disabled?: boolean;
  classNames?: SlotClasses<'root' | 'button' | 'page' | 'currentPage' | 'ellipsis'>;
  className?: string;
  'aria-label'?: string;
} & TestIdProps;

export function Pagination({
  'data-testid': testId,
  pageIndex,
  pageCount,
  onPageChange,
  disabled,
  className,
  classNames,
  'aria-label': label,
}: PaginationProps & { 'data-testid'?: string | undefined }) {
  const { t, locale } = useUILocale();
  const count = Math.max(1, Math.floor(pageCount)),
    page = Math.max(0, Math.min(pageIndex, count - 1));

  const change = (next: number) => {
    if (!disabled && next !== page) onPageChange(next);
  };

  return (
    <nav
      data-testid={testId}
      aria-label={label ?? t('pagination.label')}
      className={cn('flex flex-wrap items-center gap-1', classNames?.root, className)}
    >
      <Button
        data-testid={partTestId(testId, 'first')}
        variant="ghost"
        size="sm"
        className={cn('size-8 px-0', classNames?.button)}
        aria-label={t('pagination.first')}
        disabled={disabled || page === 0}
        onClick={() => change(0)}
      >
        <KitIcon name="first" builtin={{ outline: FirstIcon, bold: FirstBoldIcon }} />
      </Button>
      <Button
        data-testid={partTestId(testId, 'previous')}
        variant="ghost"
        size="sm"
        className={cn('size-8 px-0', classNames?.button)}
        aria-label={t('pagination.previous')}
        disabled={disabled || page === 0}
        onClick={() => change(page - 1)}
      >
        <KitIcon
          name="chevronLeft"
          builtin={{ outline: ChevronLeftIcon, bold: ChevronLeftBoldIcon }}
        />
      </Button>
      {paginationItems(page, count).map((item) =>
        typeof item === 'number' ? (
          <Button
            data-testid={partTestId(testId, 'page', item + 1)}
            key={item}
            variant={item === page ? 'primary' : 'ghost'}
            size="sm"
            className={cn(
              'min-w-8 px-2 tabular-nums',
              classNames?.button,
              classNames?.page,
              item === page && classNames?.currentPage,
            )}
            aria-label={t('pagination.page', { page: item + 1 })}
            aria-current={item === page ? 'page' : undefined}
            disabled={disabled}
            onClick={() => change(item)}
          >
            {new Intl.NumberFormat(locale.code).format(item + 1)}
          </Button>
        ) : (
          <span
            data-testid={partTestId(testId, 'ellipsis', item)}
            key={item}
            aria-hidden="true"
            className={cn(
              'flex size-8 items-center justify-center text-muted',
              classNames?.ellipsis,
            )}
          >
            …
          </span>
        ),
      )}
      <Button
        data-testid={partTestId(testId, 'next')}
        variant="ghost"
        size="sm"
        className={cn('size-8 px-0', classNames?.button)}
        aria-label={t('pagination.next')}
        disabled={disabled || page === count - 1}
        onClick={() => change(page + 1)}
      >
        <KitIcon
          name="chevronRight"
          builtin={{ outline: ChevronRightIcon, bold: ChevronRightBoldIcon }}
        />
      </Button>
      <Button
        data-testid={partTestId(testId, 'last')}
        variant="ghost"
        size="sm"
        className={cn('size-8 px-0', classNames?.button)}
        aria-label={t('pagination.last')}
        disabled={disabled || page === count - 1}
        onClick={() => change(count - 1)}
      >
        <KitIcon name="last" builtin={{ outline: LastIcon, bold: LastBoldIcon }} />
      </Button>
    </nav>
  );
}
