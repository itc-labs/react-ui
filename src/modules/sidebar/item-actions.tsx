'use client';
import type { ReactNode } from 'react';
import { cn, partTestId } from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../components/dropdown-menu';
import { dangerMenuItemClass } from '../../components/dropdown-menu/classes';
import { Icon } from '../../components/icon';
import { KitIcon } from '../../components/icon/kit-icon';
import { MoreIcon } from '../../components/icon/outline/more';
import { PlusIcon } from '../../components/icon/outline/plus';
import { useUILocale } from '../../i18n/provider';
import type { SidebarEntry, SidebarClassNames } from './types';

export function SidebarItemRow({
  item,
  children,
  testId,
  classNames,
}: {
  item: Exclude<SidebarEntry, { type: 'group' }>;
  children: ReactNode;
  testId?: string | undefined;
  classNames?: SidebarClassNames | undefined;
}) {
  const { t } = useUILocale();
  if (!item.actions?.length && !item.onAdd) return children;
  const label =
    typeof item.label === 'string' || typeof item.label === 'number'
      ? String(item.label)
      : '';
  const buttonClass = cn(
    'grid size-7 shrink-0 place-items-center rounded-control hover:bg-[var(--sidebar-hover)] text-[var(--sidebar-muted,var(--color-muted))]',
    focusRingClassName,
    classNames?.actionButton,
  );

  return (
    // Actions overlay the row's right edge (like Notion) so the row keeps its full width.
    <div
      className={cn(
        'group/sidebar-row relative min-w-0 [&>*:first-child]:w-full',
        item.onAdd && item.actions?.length
          ? '[&>*:first-child]:group-hover/sidebar-row:pr-[4.5rem] [&>*:first-child]:group-focus-within/sidebar-row:pr-[4.5rem] pointer-coarse:[&>*:first-child]:pr-[4.5rem]'
          : '[&>*:first-child]:group-hover/sidebar-row:pr-10 [&>*:first-child]:group-focus-within/sidebar-row:pr-10 pointer-coarse:[&>*:first-child]:pr-10',
      )}
    >
      {children}
      <div
        data-testid={partTestId(testId, 'actions')}
        className={cn(
          'absolute top-1/2 right-0.5 flex shrink-0 -translate-y-1/2 opacity-0 group-hover/sidebar-row:opacity-100 group-focus-within/sidebar-row:opacity-100 has-[[data-state=open]]:opacity-100 [@media(hover:none)]:opacity-100 pointer-coarse:opacity-100',
          classNames?.itemActions,
        )}
      >
        {item.onAdd && (
          <button
            type="button"
            className={buttonClass}
            data-testid={partTestId(testId, 'add')}
            onClick={(event) => {
              event.stopPropagation();
              item.onAdd?.();
            }}
          >
            <KitIcon
              name="plus"
              builtin={{ outline: PlusIcon, bold: PlusIcon }}
              className="size-4"
            />
            <span className="sr-only">
              {item.addLabel ?? t('sidebar.add', { label })}
              {!label && !item.addLabel && item.label}
            </span>
          </button>
        )}
        {!!item.actions?.length && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={buttonClass}
                data-testid={partTestId(testId, 'more')}
                onClick={(event) => event.stopPropagation()}
              >
                <KitIcon
                  name="more"
                  builtin={{ outline: MoreIcon, bold: MoreIcon }}
                  className="size-4"
                />
                <span className="sr-only">
                  {t('sidebar.moreActions', { label })}
                  {!label && item.label}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(event) => event.stopPropagation()}
            >
              {item.actions.map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  disabled={action.disabled ?? false}
                  onSelect={action.onSelect}
                  data-testid={partTestId(testId, 'action', action.id)}
                  className={cn(action.danger && dangerMenuItemClass)}
                >
                  {action.icon && (
                    <Icon
                      {...(typeof action.icon === 'string'
                        ? { name: action.icon }
                        : { glyph: action.icon })}
                      className="size-4"
                    />
                  )}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
