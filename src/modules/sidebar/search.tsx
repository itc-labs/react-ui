'use client';
import { isValidElement, type ReactNode } from 'react';
import { cn, partTestId } from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import { KitIcon } from '../../components/icon/kit-icon';
import { SearchIcon } from '../../components/icon/outline/search';
import { Kbd } from '../../components/kbd';
import { Tooltip } from '../../components/tooltip';
import { useUILocale } from '../../i18n/provider';
import type { SidebarSearch, SidebarClassNames } from './types';

export function isSidebarSearch(
  search: ReactNode | SidebarSearch,
): search is SidebarSearch {
  return (
    typeof search === 'object' &&
    search !== null &&
    !isValidElement(search) &&
    'onOpen' in search
  );
}

export function SidebarSearchControl({
  search,
  collapsed,
  testId,
  classNames,
}: {
  search: ReactNode | SidebarSearch;
  collapsed: boolean;
  testId?: string | undefined;
  classNames?: SidebarClassNames | undefined;
}) {
  const { t } = useUILocale();
  if (!isSidebarSearch(search)) return search;
  const label = search.placeholder ?? t('sidebar.search');
  const button = (
    <button
      type="button"
      onClick={search.onOpen}
      aria-label={label}
      data-testid={partTestId(testId, 'search')}
      className={cn(
        'flex w-full min-w-0 items-center gap-2 rounded-control border border-[var(--sidebar-border)] bg-transparent p-2 text-ui-sm text-[var(--sidebar-muted,var(--color-muted))] hover:bg-[var(--sidebar-hover)]',
        focusRingClassName,
        collapsed && 'justify-center',
        classNames?.search,
      )}
    >
      <KitIcon
        name="search"
        builtin={{ outline: SearchIcon, bold: SearchIcon }}
        className="size-4 shrink-0"
      />
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate text-left">{label}</span>
          {search.shortcut && (
            <Kbd
              size="sm"
              platformAware
              keys={search.shortcut.split('+').map((key) => key.trim())}
            />
          )}
        </>
      )}
    </button>
  );

  return collapsed ? <Tooltip content={label}>{button}</Tooltip> : button;
}
