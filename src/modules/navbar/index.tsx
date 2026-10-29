'use client';

import { useEffect, useState } from 'react';
import { NavigationMenu } from 'radix-ui';
import { cn, partTestId } from '../../components/common';
import { Drawer } from '../../components/drawer';
import { MenuIcon } from '../../components/icon/outline/menu';
import { IconButton } from '../../components/icon-button';
import { NavbarBrandBlock } from './brand';
import { useUILocale } from '../../i18n/provider';
import { filterNavByAccess, resolveActiveNav } from '../navigation';
import { HeaderEntries } from './entries';
import { headerNodes } from './model';
import type { NavbarProps } from './types';
export type {
  NavbarProps,
  NavbarBrand,
  NavbarItem,
  NavbarLink,
  NavbarSection,
  NavbarClassNames,
} from './types';

export function Navbar<TAccess = unknown>({
  brand,
  brandHref,
  switcher,
  activeIndicator = 'underline',
  items,
  actions,
  secondary,
  currentPath,
  isActive,
  canAccess,
  navigationLabel,
  mobileTriggerLabel,
  drawerTitle,
  sticky = true,
  elevateOnScroll = false,
  className,
  classNames,
  'data-testid': testId,
  ...props
}: NavbarProps<TAccess>) {
  const { t } = useUILocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const nodes = headerNodes(items);
  // Always filter to prune empty containers even when access is unrestricted.
  const visible = filterNavByAccess(
    nodes,
    (access, node) =>
      !canAccess || !node.source || canAccess(access as TAccess, node.source),
  );
  const activePath = resolveActiveNav(
    visible,
    currentPath ?? '',
    isActive
      ? (node, path) => Boolean(node.source && isActive(node.source, path))
      : undefined,
  );

  useEffect(() => {
    if (!elevateOnScroll) return;

    const update = () => setScrolled(window.scrollY > 0);

    update();
    window.addEventListener('scroll', update, { passive: true });

    return () => window.removeEventListener('scroll', update);
  }, [elevateOnScroll]);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  return (
    <header
      {...props}
      data-testid={testId}
      data-elevated={elevateOnScroll && scrolled}
      className={cn(
        'relative z-header w-full min-w-0 flex-1 border-b border-line bg-surface text-ink',
        sticky && 'sticky top-0',
        elevateOnScroll && scrolled && 'shadow-panel',
        classNames?.root,
        className,
      )}
    >
      <div
        data-testid={partTestId(testId, 'inner')}
        className={cn(
          'flex min-h-16 min-w-0 items-center gap-4 px-5',
          classNames?.inner,
        )}
      >
        <NavbarBrandBlock
          brand={brand}
          {...(brandHref ? { brandHref } : {})}
          {...(classNames ? { classNames } : {})}
          data-testid={testId}
        />
        {switcher != null && (
          <div
            data-testid={partTestId(testId, 'switcher')}
            className={cn('hidden shrink-0 lg:block', classNames?.switcher)}
          >
            {switcher}
          </div>
        )}
        <NavigationMenu.Root
          aria-label={navigationLabel ?? t('navbar.navigation')}
          data-testid={partTestId(testId, 'nav')}
          className={cn(
            'relative hidden min-w-0 self-stretch lg:flex lg:items-stretch [&>div]:flex',
            classNames?.nav,
          )}
        >
          <NavigationMenu.List className="flex h-full items-stretch gap-1">
            <HeaderEntries
              nodes={visible}
              activePath={activePath}
              testId={testId}
              classNames={classNames}
              activeIndicator={activeIndicator}
              topLevel
            />
          </NavigationMenu.List>
        </NavigationMenu.Root>
        <div
          data-testid={partTestId(testId, 'actions')}
          className={cn('ml-auto flex items-center gap-2', classNames?.actions)}
        >
          {actions}
        </div>
        <Drawer
          open={mobileOpen}
          onOpenChange={setMobileOpen}
          title={drawerTitle ?? t('navbar.navigation')}
          side="left"
          {...(testId ? { 'data-testid': partTestId(testId, 'drawer')! } : {})}
          className={classNames?.drawer ?? ''}
          trigger={
            <IconButton
              icon={MenuIcon}
              variant="ghost"
              label={mobileTriggerLabel ?? t('navbar.openMenu')}
              data-testid={partTestId(testId, 'mobileTrigger')}
              className={cn('lg:hidden', classNames?.mobileTrigger)}
            />
          }
        >
          <div className="mb-4 grid gap-4">
            <NavbarBrandBlock
              brand={brand}
              {...(brandHref ? { brandHref } : {})}
              {...(classNames ? { classNames } : {})}
              data-testid={partTestId(testId, 'drawer')}
            />
            {switcher != null && (
              <div
                data-testid={partTestId(testId, 'drawerSwitcher')}
                className={classNames?.switcher}
              >
                {switcher}
              </div>
            )}
          </div>
          <nav
            aria-label={navigationLabel ?? t('navbar.navigation')}
            data-testid={partTestId(testId, 'drawerNav')}
            className={cn('grid gap-1', classNames?.nav)}
          >
            <HeaderEntries
              nodes={visible}
              activePath={activePath}
              testId={partTestId(testId, 'drawer')}
              classNames={classNames}
              mobile
              onNavigate={() => setMobileOpen(false)}
            />
          </nav>
        </Drawer>
      </div>
      {secondary != null && (
        <div
          data-testid={partTestId(testId, 'secondary')}
          className={cn('border-t border-line px-5 py-2', classNames?.secondary)}
        >
          {secondary}
        </div>
      )}
    </header>
  );
}
