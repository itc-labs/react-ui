'use client';

import { useEffect, useState } from 'react';
import { NavigationMenu } from 'radix-ui';
import { cn, partTestId } from '../../components/common';
import { Drawer } from '../../components/drawer';
import { useRouterPath } from '../../components/link-image-provider';
import { MenuIcon } from '../../components/icon/outline/menu';
import { KitIconButton } from '../../components/icon-button/kit-icon-button';
import { NavbarBrandBlock } from './brand';
import { useUILocale } from '../../i18n/provider';
import { filterNavByAccess, resolveActiveNav } from '../navigation';
import { HeaderEntries } from './entries';
import { headerNodes } from './model';
import { resolveNavbarAppearance } from './appearance';
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
  appearance,
  tone: toneProp,
  itemVariant: itemVariantProp,
  density: densityProp,
  align = 'start',
  topbar,
  activeIndicator,
  items,
  actions,
  secondary,
  currentPath: currentPathProp,
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
  const { tone, itemVariant, density, floating } = resolveNavbarAppearance({
    ...(appearance !== undefined ? { appearance } : {}),
    ...(toneProp !== undefined ? { tone: toneProp } : {}),
    ...(itemVariantProp !== undefined ? { itemVariant: itemVariantProp } : {}),
    ...(densityProp !== undefined ? { density: densityProp } : {}),
    ...(activeIndicator !== undefined ? { activeIndicator } : {}),
  });
  const currentPath = useRouterPath(currentPathProp);

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
      data-navbar-tone={tone}
      data-navbar-density={density}
      data-navbar-align={align}
      data-appearance={appearance ?? 'default'}
      data-item-variant={itemVariant}
      data-navbar-floating={floating}
      className={cn(
        'navbar-root relative z-header min-w-0 border-b border-[var(--navbar-border)] bg-[var(--navbar-bg)] text-[var(--navbar-fg)] data-[navbar-tone=transparent]:border-transparent',
        sticky && 'sticky top-0',
        elevateOnScroll && scrolled && 'shadow-panel',
        classNames?.root,
        className,
      )}
    >
      {topbar != null && (
        <div
          data-testid={partTestId(testId, 'topbar')}
          className={cn('navbar-topbar', classNames?.topbar)}
        >
          {topbar}
        </div>
      )}
      <div
        data-testid={partTestId(testId, 'inner')}
        className={cn('navbar-inner', classNames?.inner)}
      >
        <div className="navbar-brand-group">
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
        </div>
        <NavigationMenu.Root
          aria-label={navigationLabel ?? t('navbar.navigation')}
          data-testid={partTestId(testId, 'nav')}
          className={cn(
            'navbar-nav relative hidden min-w-0 self-stretch lg:flex lg:items-stretch [&>div]:flex',
            classNames?.nav,
          )}
        >
          <NavigationMenu.List className="navbar-menu flex h-full items-stretch gap-1">
            <HeaderEntries
              nodes={visible}
              activePath={activePath}
              testId={testId}
              classNames={classNames}
              {...(activeIndicator ? { activeIndicator } : {})}
              itemVariant={itemVariant}
              density={density}
              topLevel
            />
          </NavigationMenu.List>
        </NavigationMenu.Root>
        <div
          data-testid={partTestId(testId, 'actions')}
          className={cn(
            'navbar-actions flex min-w-0 items-center justify-end gap-2',
            classNames?.actions,
          )}
        >
          {actions}
        </div>
        <div className="navbar-mobile-control">
          <Drawer
            open={mobileOpen}
            onOpenChange={setMobileOpen}
            title={drawerTitle ?? t('navbar.navigation')}
            side="left"
            {...(testId ? { 'data-testid': partTestId(testId, 'drawer')! } : {})}
            className={classNames?.drawer ?? ''}
            trigger={
              <KitIconButton
                icon={MenuIcon}
                variant="ghost"
                label={mobileTriggerLabel ?? t('navbar.openMenu')}
                data-testid={partTestId(testId, 'mobileTrigger')}
                className={cn(
                  'shrink-0 text-inherit',
                  align !== 'split' && 'lg:hidden',
                  classNames?.mobileTrigger,
                )}
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
                itemVariant={itemVariant}
                density={density}
                mobile
                onNavigate={() => setMobileOpen(false)}
              />
            </nav>
          </Drawer>
        </div>
      </div>
      {secondary != null && (
        <div
          data-testid={partTestId(testId, 'secondary')}
          className={cn(
            'navbar-secondary border-t border-[var(--navbar-border)] px-5 py-2',
            classNames?.secondary,
          )}
        >
          {secondary}
        </div>
      )}
    </header>
  );
}
