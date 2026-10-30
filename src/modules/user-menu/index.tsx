'use client';

import { KitIcon } from '../../components/icon/kit-icon';
import { ChevronDownIcon } from '../../components/icon/outline/chevron-down';
import { ChevronDownIcon as ChevronDownBoldIcon } from '../../components/icon/bold/chevron-down';

import type { ComponentProps, ReactNode } from 'react';
import { Avatar, type AvatarProps } from '../../components/avatar';
import { cn, partTestId, type SlotClasses } from '../../components/common';
import {
  DropdownMenu,
  type DropdownMenuClassNames,
  type DropdownMenuEntry,
  type DropdownMenuProps,
} from '../../components/dropdown-menu';
import { useUILocale } from '../../i18n/provider';

export type UserMenuClassNames = SlotClasses<
  'root' | 'avatar' | 'details' | 'name' | 'description' | 'chevron'
> &
  DropdownMenuClassNames;
export type UserMenuProps = Omit<ComponentProps<'button'>, 'children' | 'name'> & {
  name: string;
  description?: ReactNode;
  avatar?: Omit<AvatarProps, 'alt' | 'size' | 'className' | 'data-testid'>;
  compact?: boolean;
  /** Hide text and chevron below the sm breakpoint. */
  collapseOnMobile?: boolean;
  label?: string;
  items: readonly DropdownMenuEntry[];
  header?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentProps?: Extract<
    DropdownMenuProps,
    { items: readonly DropdownMenuEntry[] }
  >['contentProps'];
  classNames?: UserMenuClassNames;
  'data-testid'?: string | undefined;
};

export function UserMenu({
  name,
  description,
  avatar,
  compact = false,
  collapseOnMobile = true,
  label,
  items,
  header,
  open,
  defaultOpen,
  onOpenChange,
  contentProps,
  className,
  classNames,
  'data-testid': testId,
  ...props
}: UserMenuProps) {
  const { t } = useUILocale();
  const detailsClass = compact
    ? 'hidden'
    : collapseOnMobile
      ? 'hidden sm:block'
      : 'block';

  return (
    <DropdownMenu
      {...(open === undefined ? {} : { open })}
      {...(defaultOpen === undefined ? {} : { defaultOpen })}
      {...(onOpenChange ? { onOpenChange } : {})}
      items={items}
      header={header}
      {...(classNames ? { classNames: { ...classNames, trigger: '' } } : {})}
      {...(testId ? { 'data-testid': testId } : {})}
      contentProps={{
        align: 'end',
        ...contentProps,
        'data-testid': contentProps?.['data-testid'] ?? partTestId(testId, 'content'),
      }}
      triggerAsChild
      trigger={
        <button
          {...props}
          type={props.type ?? 'button'}
          aria-label={props['aria-label'] ?? label ?? t('userMenu.open', { name })}
          className={cn(
            'inline-flex shrink-0 items-center gap-2 rounded-control border border-line bg-surface p-1 text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-50',
            classNames?.root,
            classNames?.trigger,
            className,
          )}
        >
          <Avatar
            {...avatar}
            alt={name}
            size="sm"
            className={cn(classNames?.avatar)}
            data-testid={partTestId(testId, 'avatar')}
          />
          <span
            data-testid={partTestId(testId, 'details')}
            className={cn(
              'min-w-0 flex-1 text-left',
              detailsClass,
              classNames?.details,
            )}
          >
            <span
              data-testid={partTestId(testId, 'name')}
              className={cn(
                'block truncate text-ui-sm font-semibold',
                classNames?.name,
              )}
            >
              {name}
            </span>
            {description != null && (
              <span
                data-testid={partTestId(testId, 'description')}
                className={cn(
                  'block truncate text-xs text-muted',
                  classNames?.description,
                )}
              >
                {description}
              </span>
            )}
          </span>
          <KitIcon
            name="chevronDown"
            builtin={{ outline: ChevronDownIcon, bold: ChevronDownBoldIcon }}
            size={16}
            data-testid={partTestId(testId, 'chevron')}
            className={cn(
              'ml-auto mr-1 shrink-0 text-muted',
              detailsClass,
              classNames?.chevron,
            )}
          />
        </button>
      }
    />
  );
}
