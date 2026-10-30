'use client';
import { isValidElement, type ReactNode } from 'react';
import { cn, partTestId } from '../../components/common';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '../../components/dropdown-menu';
import { KitIcon } from '../../components/icon/kit-icon';
import { ChevronDownIcon } from '../../components/icon/outline/chevron-down';
import { focusRingClassName } from '../../components/common/focus-ring';
import { UiLink } from '../../components/link-image-provider';
import type { SidebarBrand, SidebarClassNames } from './types';

export function SidebarHeader({
  header,
  collapsed,
  classNames,
  testId,
}: {
  header: ReactNode | SidebarBrand;
  collapsed: boolean;
  classNames?: SidebarClassNames | undefined;
  testId?: string | undefined;
}) {
  if (
    typeof header !== 'object' ||
    header === null ||
    isValidElement(header) ||
    !('title' in header)
  )
    return header as ReactNode;
  const content = (
    <>
      {header.logo != null && (
        <span
          data-testid={partTestId(testId, 'brandLogo')}
          className={cn(
            'grid size-8 shrink-0 place-items-center rounded-control bg-[var(--sidebar-solid-bg,var(--color-accent))] text-[var(--sidebar-solid-fg,var(--color-on-brand))] [&>svg]:size-4',
            classNames?.brandLogo,
          )}
        >
          {header.logo}
        </span>
      )}
      <span className={collapsed ? 'sr-only' : 'min-w-0'}>
        <strong
          data-testid={partTestId(testId, 'brandTitle')}
          className={cn(
            'block truncate text-control font-semibold leading-tight',
            classNames?.brandTitle,
          )}
        >
          {header.title}
        </strong>
        {header.subtitle != null && (
          <span
            data-testid={partTestId(testId, 'brandSubtitle')}
            className={cn(
              'block truncate text-ui-sm leading-tight text-[var(--sidebar-muted,var(--color-muted))]',
              classNames?.brandSubtitle,
            )}
          >
            {header.subtitle}
          </span>
        )}
      </span>
    </>
  );
  const props = {
    className: cn(
      'flex min-w-0 items-center gap-2.5 rounded-control p-1.5',
      (header.href || header.switcher) &&
        'motion-safe:transition-colors hover:bg-[var(--sidebar-hover,var(--color-hover))] focus-visible:outline-2 focus-visible:outline-focus',
      collapsed && 'justify-center',
      header.switcher && cn('w-full text-left', focusRingClassName),
      classNames?.brand,
    ),
    'data-testid': partTestId(testId, 'brand'),
  };

  const switcher = header.switcher;

  if (switcher)
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button {...props} type="button">
            {content}
            {(!collapsed || header.logo == null) && (
              <KitIcon
                name="chevronDown"
                builtin={{ outline: ChevronDownIcon, bold: ChevronDownIcon }}
                className="ml-auto size-4 shrink-0"
              />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          data-testid={partTestId(testId, 'workspaceMenu')}
          className={classNames?.workspaceMenu}
        >
          {switcher.items.map((workspace) => (
            <DropdownMenuCheckboxItem
              key={workspace.id}
              checked={switcher.value === workspace.id}
              onSelect={() => switcher.onValueChange(workspace.id)}
              data-testid={partTestId(testId, 'workspace', workspace.id)}
              className={classNames?.workspaceItem}
            >
              {workspace.logo != null && (
                <span className="shrink-0 [&>svg]:size-5">{workspace.logo}</span>
              )}
              <span className="min-w-0">
                <span className="block">{workspace.label}</span>
                {workspace.description != null && (
                  <span className="block text-ui-sm text-muted">
                    {workspace.description}
                  </span>
                )}
              </span>
            </DropdownMenuCheckboxItem>
          ))}
          {switcher.footer != null && (
            <>
              <DropdownMenuSeparator />
              {switcher.footer}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );

  return header.href ? (
    <UiLink {...props} href={header.href}>
      {content}
    </UiLink>
  ) : (
    <div {...props}>{content}</div>
  );
}
