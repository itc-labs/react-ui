'use client';

import { useUILocale } from '../../i18n/provider';
import { cn, partTestId } from '../../components/common';
import { SidebarEntryIcon, SidebarEntryLabel, SidebarRailEntry } from './rail-entry';
import { SidebarEntryGroup } from './group';
import { SidebarItemRow } from './item-actions';
import { SidebarItem } from './item';
import {
  SidebarSubmenu,
  SidebarSubmenuRow,
  SidebarSubmenuTrigger,
  SidebarSubmenuContent,
} from './submenu';
import type { SidebarEntry } from './types';
import type { SidebarProps } from './index';

export function SidebarEntries({
  items,
  activePath,
  testId,
  classNames,
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: (() => void) | undefined;
  items: readonly SidebarEntry[];
  activePath: readonly string[];
  testId?: string | undefined;
  classNames?: SidebarProps['classNames'] | undefined;
}) {
  const { t } = useUILocale();

  return (
    <>
      {items.map((item) => {
        const inActivePath = activePath[0] === item.id;
        const active = inActivePath && activePath.length === 1;
        const childActivePath = inActivePath ? activePath.slice(1) : [];
        const id = partTestId(testId, item.type ?? 'item', item.id);
        if (item.type === 'group')
          return (
            <SidebarEntryGroup
              key={item.id}
              item={item}
              activeKey={childActivePath.join('/')}
              collapsed={collapsed}
              testId={id}
              classNames={classNames}
            >
              <div className="grid gap-0.5">
                <SidebarEntries
                  items={item.items}
                  activePath={childActivePath}
                  testId={id}
                  classNames={classNames}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              </div>
            </SidebarEntryGroup>
          );
        if (collapsed)
          return (
            <SidebarRailEntry
              key={item.id}
              item={item}
              activePath={activePath}
              testId={id}
              classNames={classNames}
            />
          );
        const icon = item.icon ? (
          <SidebarEntryIcon item={item} testId={id} classNames={classNames} />
        ) : undefined;
        const label = (
          <SidebarEntryLabel item={item} testId={id} classNames={classNames} />
        );

        const select = () => {
          item.onSelect?.();
          onNavigate?.();
        };

        if (item.type === 'submenu')
          return (
            <SidebarSubmenu
              key={item.id}
              data-testid={id}
              active={inActivePath}
              {...(item.disabled === undefined ? {} : { disabled: item.disabled })}
              {...(item.defaultOpen === undefined
                ? {}
                : { defaultOpen: item.defaultOpen })}
              {...(item.open === undefined ? {} : { open: item.open })}
              {...(item.onOpenChange ? { onOpenChange: item.onOpenChange } : {})}
              className={cn(classNames?.submenu, item.className)}
            >
              <SidebarItemRow item={item} testId={id} classNames={classNames}>
                {item.href ? (
                  <SidebarSubmenuRow>
                    <SidebarItem
                      {...(!item.disabled ? { href: item.href } : {})}
                      active={active}
                      aria-disabled={item.disabled || undefined}
                      {...(item.onSelect || onNavigate ? { onClick: select } : {})}
                      className={classNames?.item}
                      icon={icon}
                    >
                      {label}
                    </SidebarItem>
                    <SidebarSubmenuTrigger
                      iconOnly
                      aria-label={
                        item.toggleLabel ??
                        (typeof item.label === 'string'
                          ? t('sidebar.toggle', { label: item.label })
                          : undefined)
                      }
                      className={classNames?.submenuTrigger}
                      classNames={{
                        icon: classNames?.submenuIcon ?? '',
                        label: cn('flex-1', classNames?.submenuLabel),
                        chevron: classNames?.submenuChevron ?? '',
                      }}
                    >
                      {item.label}
                    </SidebarSubmenuTrigger>
                  </SidebarSubmenuRow>
                ) : (
                  <SidebarSubmenuTrigger
                    icon={icon}
                    className={classNames?.submenuTrigger}
                    classNames={{
                      icon: classNames?.submenuIcon ?? '',
                      label: cn('flex-1', classNames?.submenuLabel),
                      chevron: classNames?.submenuChevron ?? '',
                    }}
                  >
                    {label}
                  </SidebarSubmenuTrigger>
                )}
              </SidebarItemRow>
              <SidebarSubmenuContent
                data-testid={partTestId(id, 'content')}
                className={classNames?.submenuContent}
                contentClassName={classNames?.submenuBody ?? ''}
              >
                <SidebarEntries
                  items={item.items}
                  activePath={childActivePath}
                  testId={id}
                  classNames={classNames}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              </SidebarSubmenuContent>
            </SidebarSubmenu>
          );
        if (!item.href && item.onSelect)
          return (
            <SidebarItemRow
              key={item.id}
              item={item}
              testId={id}
              classNames={classNames}
            >
              <SidebarItem
                asChild
                active={active}
                icon={icon}
                className={cn(classNames?.item, item.className)}
              >
                <button
                  type="button"
                  disabled={item.disabled}
                  onClick={select}
                  data-testid={id}
                >
                  {label}
                </button>
              </SidebarItem>
            </SidebarItemRow>
          );

        return (
          <SidebarItemRow key={item.id} item={item} testId={id} classNames={classNames}>
            <SidebarItem
              {...(!item.disabled && item.href ? { href: item.href } : {})}
              data-testid={id}
              {...((item.onSelect || onNavigate) && !item.disabled
                ? { onClick: select }
                : {})}
              aria-disabled={item.disabled || undefined}
              {...(item.disabled ? { tabIndex: -1 } : {})}
              active={active}
              icon={icon}
              className={cn(
                item.disabled && 'cursor-not-allowed opacity-50',
                classNames?.item,
                item.className,
              )}
            >
              {label}
            </SidebarItem>
          </SidebarItemRow>
        );
      })}
    </>
  );
}
