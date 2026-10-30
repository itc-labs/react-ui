import { isValidElement, type ReactNode } from 'react';
import { cn, partTestId } from '../../components/common';
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
            'grid size-8 shrink-0 place-items-center rounded-control bg-accent text-on-brand [&>svg]:size-4',
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
              'block truncate text-ui-sm leading-tight text-muted',
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
      header.href &&
        'motion-safe:transition-colors hover:bg-surface/60 focus-visible:outline-2 focus-visible:outline-focus',
      collapsed && 'justify-center',
      classNames?.brand,
    ),
    'data-testid': partTestId(testId, 'brand'),
  };

  return header.href ? (
    <UiLink {...props} href={header.href}>
      {content}
    </UiLink>
  ) : (
    <div {...props}>{content}</div>
  );
}
