'use client';
import type { ReactNode } from 'react';
import { partTestId } from '../../components/common/testing';

import { useUILocale } from '../../i18n/provider';
import { cn } from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import type { DataTableProps } from './types';
import { useDataTable } from './use-data-table';
import { DataTableToolbar } from './toolbar';
import { DataTableFeedback } from './feedback';
import { DataTableHeader } from './header';
import { DataTableBody } from './body';
import { DataTableFooter } from './footer';

const PassThrough = ({ children }: { children: ReactNode }) => children;

export type { DataTableRowReorderPlugin } from '../dnd/integration-types';
export type { DataTableProps } from './types';
export type { ColumnDef, SortingState, PaginationState } from '@tanstack/react-table';
export type { DataTableState } from './state';
export type { DataTableAlign } from './align';

export function DataTable<T>(props: DataTableProps<T>) {
  const { t } = useUILocale();
  const view = useDataTable(props);
  const { className } = props;
  const {
    classNames,
    loading,
    initialLoading,
    filterable,
    selectable,
    hideableColumns,
    error,
    scrollRef,
    stickyHeader,
    maxHeight,
    table,
    resizable,
    caption,
    paginated,
  } = view;

  const Provider = props.rowReorder?.plugin.Provider ?? PassThrough;

  return (
    <Provider
      items={view.visibleRows.map((row) => ({
        id: row.id,
        label: row.id,
        container: 'rows',
      }))}
      containers={['rows']}
      containerLabels={{ rows: caption }}
      disabled={view.reorderDisabled}
      overlayClassName={classNames?.dragOverlay}
      testId={props['data-testid']}
      onDrop={(id, container, index) => {
        if (view.reorderDisabled || container !== 'rows') return;
        const orderedIds = props.rows.map(props.rowId);
        const from = orderedIds.indexOf(id);
        const target = view.visibleRows[index];
        const to = target ? orderedIds.indexOf(target.id) : orderedIds.length - 1;
        if (from < 0 || to < 0 || from === to) return;
        orderedIds.splice(from, 1);
        orderedIds.splice(to, 0, id);
        props.rowReorder?.onReorder(orderedIds, { id, from, to });
      }}
    >
      <div
        data-testid={props['data-testid']}
        className={cn(
          'relative min-w-0 overflow-hidden rounded-panel border border-line bg-surface shadow-panel',
          classNames?.root,
          className,
        )}
      >
        <span
          role={loading ? 'status' : undefined}
          aria-live="polite"
          className="sr-only"
        >
          {loading
            ? initialLoading
              ? t('table.loadingAnnouncement')
              : t('table.updatingAnnouncement')
            : ''}
        </span>
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 z-20 h-0.5 overflow-hidden',
            loading && 'bg-brand-100',
          )}
        >
          {loading && (
            <div className="h-full w-1/3 bg-brand-500 motion-safe:animate-table-loading" />
          )}
        </div>
        {(filterable || selectable || hideableColumns) && (
          <DataTableToolbar view={view} />
        )}
        {error && <DataTableFeedback view={view} />}
        <div
          data-testid={partTestId(view.testId, 'scrollArea')}
          ref={scrollRef}
          style={stickyHeader ? { maxHeight } : undefined}
          className={cn(
            'overflow-auto focus-visible:-outline-offset-2',
            focusRingClassName,
            classNames?.scrollArea,
          )}
          role="region"
          aria-label={caption}
          tabIndex={0}
        >
          <table
            data-testid={partTestId(view.testId, 'table')}
            style={
              resizable
                ? {
                    width:
                      table.getTotalSize() +
                      (selectable ? 44 : 0) +
                      (view.reorderHandle ? 44 : 0),
                    tableLayout: 'fixed',
                  }
                : undefined
            }
            className={cn(
              'w-full border-collapse text-left text-ui-sm',
              classNames?.table,
            )}
            aria-busy={loading}
          >
            <caption
              data-testid={partTestId(view.testId, 'caption')}
              className={cn('sr-only', classNames?.caption)}
            >
              {caption}
            </caption>
            <DataTableHeader view={view} />
            <DataTableBody view={view} />
          </table>
        </div>
        {paginated && <DataTableFooter view={view} />}
      </div>
    </Provider>
  );
}
