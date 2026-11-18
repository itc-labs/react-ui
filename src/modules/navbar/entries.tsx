import { KitIcon } from '../../components/icon/kit-icon';
import { ChevronDownIcon } from '../../components/icon/outline/chevron-down';
import { ChevronDownIcon as ChevronDownBoldIcon } from '../../components/icon/bold/chevron-down';
import { ChevronRightIcon } from '../../components/icon/outline/chevron-right';
import { ChevronRightIcon as ChevronRightBoldIcon } from '../../components/icon/bold/chevron-right';
import { NavigationMenu } from 'radix-ui';
import { useRef, useState, type KeyboardEvent } from 'react';
import { cn, partTestId } from '../../components/common';
import { Icon } from '../../components/icon';
import { UiLink } from '../../components/link-image-provider';
import { navbarIndicatorClass, navbarItemClasses } from './appearance';
import { MegaPanel } from './mega';
import { MobileMenu } from './mobile';
import type { HeaderNode } from './model';
import type {
  NavbarCategory,
  NavbarClassNames,
  NavbarDensity,
  NavbarDropdown,
  NavbarItem,
  NavbarItemVariant,
  NavbarSection,
} from './types';

export const rowClass =
  'flex items-center gap-2 rounded-control px-3 py-2 text-ui-sm text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-focus data-[active=true]:bg-selected data-[active=true]:text-selected-ink';

type Labelled<TAccess> =
  | NavbarItem<TAccess>
  | NavbarDropdown<TAccess>
  | NavbarCategory<TAccess>
  | (Pick<NavbarSection<TAccess>, 'id'> & { label: NavbarSection<TAccess>['title'] });

export function HeaderLabel<TAccess>({
  item,
  className,
  testId,
}: {
  item: Labelled<TAccess>;
  className?: string | undefined;
  testId?: string | undefined;
}) {
  const icon = 'icon' in item ? item.icon : undefined;

  return (
    <>
      {icon && (
        <Icon
          {...(typeof icon === 'string' ? { name: icon } : { glyph: icon })}
          size={16}
          className={cn('shrink-0', className)}
          data-testid={partTestId(testId, 'icon')}
        />
      )}
      <span className="min-w-0">
        {item.label}
        {'description' in item && item.description != null && (
          <span className="block text-xs text-muted">{item.description}</span>
        )}
      </span>
    </>
  );
}

export type EntriesProps<TAccess> = {
  nodes: readonly HeaderNode<TAccess>[];
  activePath: readonly string[];
  testId: string | undefined;
  classNames: NavbarClassNames | undefined;
  /** @deprecated Use itemVariant. */
  activeIndicator?: 'underline' | 'pill';
  itemVariant?: NavbarItemVariant;
  density?: NavbarDensity;
  mobile?: boolean;
  topLevel?: boolean;
  onNavigate?: () => void;
};

const chevronRight = { outline: ChevronRightIcon, bold: ChevronRightBoldIcon };
const chevronDown = { outline: ChevronDownIcon, bold: ChevronDownBoldIcon };

/** A link row inside a dropdown, a nested flyout or a mega panel. */
export function MenuLink<TAccess>({
  node,
  active,
  testId,
  classNames,
  onNavigate,
  className,
  plain = false,
}: {
  node: HeaderNode<TAccess>;
  active: boolean;
  testId: string | undefined;
  classNames: NavbarClassNames | undefined;
  onNavigate?: (() => void) | undefined;
  className?: string;
  /** Mega panels list links as text, not as padded rows. */
  plain?: boolean;
}) {
  const item = node.source as NavbarItem<TAccess>;
  const id = partTestId(testId, 'item', node.id);

  return (
    <div data-testid={id} className={classNames?.item}>
      <NavigationMenu.Link asChild active={active}>
        <UiLink
          href={node.href ?? '#'}
          data-testid={partTestId(id, 'link')}
          data-active={active}
          aria-current={active ? 'page' : undefined}
          onClick={onNavigate}
          className={cn(
            plain
              ? 'flex items-center gap-2 rounded-control py-1 text-ui-sm text-[var(--navbar-panel-muted,var(--color-muted))] hover:text-[var(--navbar-panel-fg,var(--color-ink))] focus-visible:outline-2 focus-visible:outline-focus data-[active=true]:font-medium data-[active=true]:text-[var(--navbar-panel-fg,var(--color-ink))]'
              : rowClass,
            classNames?.link,
            item.className,
            className,
          )}
        >
          <HeaderLabel item={item} className={classNames?.icon} testId={id} />
        </UiLink>
      </NavigationMenu.Link>
    </div>
  );
}

/**
 * A nested dropdown opens to the side. Hover, Enter, Space and ArrowRight open it;
 * ArrowLeft and Escape close it and return focus to its trigger.
 */
function NestedDropdown<TAccess>({
  node,
  activePath,
  testId,
  classNames,
  onNavigate,
}: {
  node: HeaderNode<TAccess>;
  activePath: readonly string[];
  testId: string | undefined;
  classNames: NavbarClassNames | undefined;
  onNavigate?: (() => void) | undefined;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef<ReturnType<typeof setTimeout>>(undefined);
  const item = node.source as NavbarDropdown<TAccess>;
  const id = partTestId(testId, 'item', node.id);
  const active = activePath[0] === node.id;

  const show = (focus = false) => {
    clearTimeout(close.current);
    setOpen(true);

    if (focus)
      requestAnimationFrame(() =>
        panel.current?.querySelector<HTMLElement>('a, button')?.focus(),
      );
  };

  const hide = (focus = false) => {
    setOpen(false);

    if (focus) trigger.current?.focus();
  };

  const onPanelKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'Escape') return;

    // Keep the parent menu open; only this level closes.
    event.preventDefault();
    event.stopPropagation();
    hide(true);
  };

  return (
    <div
      data-testid={id}
      className={cn('relative', classNames?.item)}
      onPointerEnter={() => show()}
      onPointerLeave={() => {
        close.current = setTimeout(() => setOpen(false), 150);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        data-testid={partTestId(id, 'trigger')}
        data-active={active}
        onClick={() => (open ? hide() : show(true))}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowRight') return;

          event.preventDefault();
          show(true);
        }}
        className={cn(rowClass, 'w-full justify-between', classNames?.trigger)}
      >
        <span className="flex min-w-0 items-center gap-2">
          <HeaderLabel item={item} className={classNames?.icon} testId={id} />
        </span>
        <KitIcon name="chevronRight" builtin={chevronRight} size={16} />
      </button>
      {open && (
        <div
          ref={panel}
          data-navbar-nested=""
          data-testid={partTestId(id, 'content')}
          onKeyDown={onPanelKeyDown}
          className={cn(
            'absolute left-full top-0 z-popover ms-1 grid w-max min-w-48 max-w-[calc(100vw-2rem)] gap-1 rounded-panel border border-line bg-surface p-2 shadow-floating',
            classNames?.content,
          )}
        >
          <DropdownList
            nodes={node.items ?? []}
            activePath={active ? activePath.slice(1) : []}
            testId={id}
            classNames={classNames}
            onNavigate={onNavigate}
          />
        </div>
      )}
    </div>
  );
}

function DropdownList<TAccess>({
  nodes,
  activePath,
  testId,
  classNames,
  onNavigate,
}: {
  nodes: readonly HeaderNode<TAccess>[];
  activePath: readonly string[];
  testId: string | undefined;
  classNames: NavbarClassNames | undefined;
  onNavigate?: (() => void) | undefined;
}) {
  return (
    <>
      {nodes.map((node) =>
        node.items ? (
          <NestedDropdown
            key={node.id}
            node={node}
            activePath={activePath[0] === node.id ? activePath : []}
            testId={testId}
            classNames={classNames}
            onNavigate={onNavigate}
          />
        ) : (
          <MenuLink
            key={node.id}
            node={node}
            active={activePath[0] === node.id}
            testId={testId}
            classNames={classNames}
            onNavigate={onNavigate}
          />
        ),
      )}
    </>
  );
}

export function HeaderEntries<TAccess>({
  nodes,
  activePath,
  testId,
  classNames,
  activeIndicator,
  itemVariant,
  density = 'default',
  mobile = false,
  onNavigate,
}: EntriesProps<TAccess>) {
  if (mobile)
    return (
      <MobileMenu
        nodes={nodes}
        activePath={activePath}
        testId={testId}
        classNames={classNames}
        {...(onNavigate ? { onNavigate } : {})}
      />
    );

  const variant = itemVariant ?? activeIndicator ?? 'underline';
  const indicatorClass = navbarIndicatorClass(variant);

  return (
    <>
      {nodes.map((node) => {
        const id = partTestId(testId, 'item', node.id);
        const active = activePath[0] === node.id;
        const item = node.source as NavbarItem<TAccess>;
        const rowClasses = navbarItemClasses(variant, density, active);
        const indicator =
          indicatorClass && active ? (
            <span
              aria-hidden="true"
              data-testid={partTestId(id, 'activeIndicator')}
              className={cn(
                'pointer-events-none',
                indicatorClass,
                classNames?.activeIndicator,
              )}
            />
          ) : null;

        if (!node.items)
          return (
            <NavigationMenu.Item
              key={node.id}
              data-testid={id}
              className={cn('relative flex items-center', classNames?.item)}
            >
              <NavigationMenu.Link asChild active={active}>
                <UiLink
                  href={node.href ?? '#'}
                  data-testid={partTestId(id, 'link')}
                  data-active={active}
                  aria-current={active ? 'page' : undefined}
                  onClick={onNavigate}
                  className={cn(rowClasses, classNames?.link, item.className)}
                >
                  <HeaderLabel item={item} className={classNames?.icon} testId={id} />
                  {indicator}
                </UiLink>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          );

        const mega = item.type === 'mega';
        // A full-width panel anchors to the navbar, so its item must not be the containing block.
        const fullWidth = mega && item.width !== 'content';

        return (
          <NavigationMenu.Item
            key={node.id}
            value={node.id}
            data-testid={id}
            className={cn(
              fullWidth ? 'static flex items-center' : 'relative flex items-center',
              classNames?.item,
              item.className,
            )}
          >
            <NavigationMenu.Trigger
              data-testid={partTestId(id, 'trigger')}
              data-active={active}
              className={cn(rowClasses, 'group', classNames?.trigger)}
            >
              <HeaderLabel item={item} className={classNames?.icon} testId={id} />
              <KitIcon
                name="chevronDown"
                builtin={chevronDown}
                size={16}
                className="group-data-[state=open]:rotate-180"
              />
              {indicator}
            </NavigationMenu.Trigger>
            <NavigationMenu.Content
              data-testid={partTestId(id, 'content')}
              onEscapeKeyDown={(event) => {
                // Escape inside a side panel closes only that panel.
                if ((event.target as Element | null)?.closest?.('[data-navbar-nested]'))
                  event.preventDefault();
              }}
              className={cn(
                mega
                  ? null
                  : 'absolute left-0 top-full z-popover mt-2 grid w-max min-w-48 max-w-[calc(100vw-2rem)] gap-1 rounded-panel border border-line bg-surface p-2 text-ink shadow-floating',
                classNames?.content,
              )}
            >
              {mega ? (
                <MegaPanel
                  item={item}
                  node={node}
                  activePath={active ? activePath.slice(1) : []}
                  testId={id}
                  classNames={classNames}
                  fullWidth={fullWidth}
                  {...(onNavigate ? { onNavigate } : {})}
                />
              ) : (
                <DropdownList
                  nodes={node.items}
                  activePath={active ? activePath.slice(1) : []}
                  testId={id}
                  classNames={classNames}
                  onNavigate={onNavigate}
                />
              )}
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        );
      })}
    </>
  );
}
