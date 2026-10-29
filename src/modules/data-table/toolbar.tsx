'use client';
import { partTestId } from '../../components/common/testing';

import { useUILocale } from '../../i18n/provider';
import { cn } from '../../components/common';
import type { DataTableView } from './use-data-table';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Icon } from '../../components/icon';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '../../components/dropdown-menu';

export function DataTableToolbar<T>({
  view,
  className,
}: {
  view: DataTableView<T>;
  className?: string;
}) {
  const { t } = useUILocale();
  const {
    table,
    state,
    caption,
    loading,
    filterable,
    selectable,
    hideableColumns,
    classNames,
  } = view;

  return (
    <div
      data-testid={partTestId(view.testId, 'toolbar')}
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-b border-line p-3',
        classNames?.toolbar,
        className,
      )}
    >
      {filterable && (
        <Input
          data-testid={partTestId(view.testId, 'filter')}
          aria-label={t('table.searchLabel', { caption })}
          placeholder={t('table.search')}
          size="sm"
          rootClassName={cn('w-full sm:max-w-xs', classNames?.filter)}
          value={state.globalFilter ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
        />
      )}
      {selectable && (
        <span
          data-testid={partTestId(view.testId, 'selection')}
          role="status"
          aria-label={t('table.selectionLabel')}
          className={cn('text-ui-sm text-muted', classNames?.selection)}
        >
          {t('table.selected', {
            count: Object.values(state.rowSelection ?? {}).filter(Boolean).length,
            pageCount: table.getRowModel().rows.filter((row) => row.getIsSelected())
              .length,
          })}
        </span>
      )}
      {selectable && Object.values(state.rowSelection ?? {}).some(Boolean) && (
        <Button
          data-testid={partTestId(view.testId, 'clearSelection')}
          variant="ghost"
          size="sm"
          disabled={loading}
          className={classNames?.clearSelection}
          onClick={() => table.resetRowSelection(true)}
        >
          {t('table.clearSelection')}
        </Button>
      )}
      {hideableColumns && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              data-testid={partTestId(view.testId, 'columnsTrigger')}
              variant="secondary"
              size="sm"
              className={classNames?.columnsTrigger}
              disabled={loading}
            >
              <Icon name="settings" />
              {t('table.columns')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            data-testid={partTestId(view.testId, 'columnsMenu')}
            align="end"
          >
            <DropdownMenuLabel>{t('table.showColumns')}</DropdownMenuLabel>
            {table
              .getAllLeafColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  data-testid={partTestId(view.testId, 'columnToggle', column.id)}
                  key={column.id}
                  checked={column.getIsVisible()}
                  disabled={
                    column.getIsVisible() && table.getVisibleLeafColumns().length === 1
                  }
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(checked) => column.toggleVisibility(checked)}
                >
                  {typeof column.columnDef.header === 'string'
                    ? column.columnDef.header
                    : column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
