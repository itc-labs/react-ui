import { NavigationMenu } from 'radix-ui';
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { cn, partTestId } from '../../components/common';
import { KitIcon } from '../../components/icon/kit-icon';
import { ArrowRightIcon } from '../../components/icon/outline/arrow-right';
import { ArrowRightIcon as ArrowRightBoldIcon } from '../../components/icon/bold/arrow-right';
import { ChevronRightIcon } from '../../components/icon/outline/chevron-right';
import { ChevronRightIcon as ChevronRightBoldIcon } from '../../components/icon/bold/chevron-right';
import { UiLink } from '../../components/link-image-provider';
import { HeaderLabel, MenuLink } from './entries';
import type { HeaderNode } from './model';
import type { NavbarClassNames, NavbarMega } from './types';

const arrowRight = { outline: ArrowRightIcon, bold: ArrowRightBoldIcon };
const chevronRight = { outline: ChevronRightIcon, bold: ChevronRightBoldIcon };

type PanelProps<TAccess> = {
  item: NavbarMega<TAccess>;
  node: HeaderNode<TAccess>;
  activePath: readonly string[];
  testId: string | undefined;
  classNames: NavbarClassNames | undefined;
  fullWidth: boolean;
  onNavigate?: () => void;
};

/** Panel colours follow the navbar tone through CSS variables, so a dark bar opens a dark panel. */
const panelClass =
  'rounded-panel border border-[var(--navbar-panel-border,var(--color-line))] bg-[var(--navbar-panel-bg,var(--color-surface))] text-[var(--navbar-panel-fg,var(--color-ink))] shadow-floating';

/**
 * Keeps a full-width panel under the whole navbar rather than under its trigger. The panel is
 * absolutely positioned from an anchor in the menu, so it stays correct inside transformed or
 * scrolling containers, such as a docs preview, where fixed positioning would drift.
 */
function useHeaderAnchor(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>();

  useLayoutEffect(() => {
    const anchor = ref.current;
    const header = anchor?.closest('header');
    if (!enabled || !anchor || !header) return;

    const update = () => {
      const origin = anchor.getBoundingClientRect();
      const bounds = header.getBoundingClientRect();
      const inset = 16;
      const left = Math.max(bounds.left, inset);
      const right = Math.min(bounds.right, window.innerWidth - inset);

      setStyle({
        top: bounds.bottom - origin.top + 8,
        left: left - origin.left,
        width: Math.max(right - left, 0),
      });
    };

    update();

    const observer = new ResizeObserver(update);

    observer.observe(header);
    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [enabled]);

  return { ref, style };
}

function Section<TAccess>({
  node,
  activePath,
  testId,
  classNames,
  onNavigate,
  className,
}: {
  node: HeaderNode<TAccess>;
  activePath: readonly string[];
  testId: string | undefined;
  classNames: NavbarClassNames | undefined;
  onNavigate?: (() => void) | undefined;
  className?: string;
}) {
  const section = node.section!;
  const id = partTestId(testId, 'section', node.id);
  const active = activePath[0] === node.id;
  const childPath = active ? activePath.slice(1) : [];
  const links = (node.items ?? []).filter((child) => child.role !== 'more');
  const more = node.items?.find((child) => child.role === 'more');
  const titleClass =
    'text-ui-sm font-semibold text-[var(--navbar-panel-accent,var(--color-accent))]';

  return (
    <section
      data-testid={id}
      className={cn('grid min-w-0 content-start gap-1', classNames?.section, className)}
    >
      <h3 className={cn('mb-1', titleClass)}>
        {section.href ? (
          <NavigationMenu.Link asChild>
            <UiLink
              href={section.href}
              onClick={onNavigate}
              className="hover:underline focus-visible:outline-2 focus-visible:outline-focus"
            >
              {section.title}
            </UiLink>
          </NavigationMenu.Link>
        ) : (
          section.title
        )}
      </h3>
      {links.map((child) => (
        <MenuLink
          key={child.id}
          node={child}
          active={childPath[0] === child.id}
          testId={id}
          classNames={classNames}
          onNavigate={onNavigate}
          plain
        />
      ))}
      {more && (
        <MenuLink
          node={more}
          active={childPath[0] === more.id}
          testId={id}
          classNames={{ ...classNames, link: cn(classNames?.link, classNames?.more) }}
          onNavigate={onNavigate}
          className="mt-1 font-medium text-[var(--navbar-panel-fg,var(--color-ink))] [&_svg]:size-4"
          plain
        />
      )}
    </section>
  );
}

function ColumnsPanel<TAccess>({
  item,
  node,
  activePath,
  testId,
  classNames,
  onNavigate,
}: Omit<PanelProps<TAccess>, 'fullWidth'>) {
  const children = node.items ?? [];
  const featured = children.find((child) => child.role === 'featured');
  const sections = children.filter(
    (child) => child.section && child.role !== 'featured',
  );
  const footer = children.find((child) => child.role === 'footer');
  const footerLinks = footer?.items?.length ?? 0;
  // The footer row lines up under the sections; extra footer links add columns rather than wrap.
  const columns = Math.max(
    1,
    item.columns ?? Math.min(sections.length, 5),
    footerLinks,
  );
  // Grid tracks depend on data, so they are set inline; everything else uses tokens.
  const tracks = {
    gridTemplateColumns: `${featured ? 'minmax(10rem,14rem) ' : ''}repeat(${columns}, minmax(0, 1fr))`,
  };

  return (
    <>
      <div className="grid gap-x-8 gap-y-6 p-6" style={tracks}>
        {featured && (
          <Section
            node={featured}
            activePath={activePath[0] === featured.id ? activePath : []}
            testId={testId}
            classNames={classNames}
            onNavigate={onNavigate}
            className={cn(
              'row-span-full border-e border-[var(--navbar-panel-border,var(--color-line))] pe-8',
              classNames?.featured,
            )}
          />
        )}
        {sections.map((section) => (
          <Section
            key={section.id}
            node={section}
            activePath={activePath[0] === section.id ? activePath : []}
            testId={testId}
            classNames={classNames}
            onNavigate={onNavigate}
          />
        ))}
      </div>
      {footer && (
        <div
          data-testid={partTestId(testId, 'footer')}
          className={cn(
            'grid gap-x-8 border-t border-[var(--navbar-panel-border,var(--color-line))] px-6 py-4',
            classNames?.footer,
          )}
          style={tracks}
        >
          {featured && <span aria-hidden="true" />}
          {(footer.items ?? []).map((link) => (
            <MenuLink
              key={link.id}
              node={link}
              active={activePath[0] === footer.id && activePath[1] === link.id}
              testId={partTestId(testId, 'footer')}
              classNames={classNames}
              onNavigate={onNavigate}
              className="font-medium text-[var(--navbar-panel-fg,var(--color-ink))]"
              plain
            />
          ))}
        </div>
      )}
    </>
  );
}

function CategoriesPanel<TAccess>({
  node,
  activePath,
  testId,
  classNames,
  onNavigate,
}: Omit<PanelProps<TAccess>, 'fullWidth' | 'item'>) {
  const categories = (node.items ?? []).filter((child) => child.category);
  const routeCategory = categories.find((category) => category.id === activePath[0]);
  const [selectedId, setSelectedId] = useState(routeCategory?.id ?? categories[0]?.id);
  const selected =
    categories.find((category) => category.id === selectedId) ?? categories[0];
  if (!selected) return null;

  const category = selected.category!;
  const sections = (selected.items ?? []).filter((child) => child.section);
  const action = selected.items?.find((child) => child.role === 'action');
  const childPath = activePath[0] === selected.id ? activePath.slice(1) : [];

  return (
    <div className="grid gap-6 p-6 md:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)]">
      <div
        role="list"
        aria-label={
          typeof node.source?.label === 'string' ? node.source.label : undefined
        }
        className="grid content-start gap-2"
      >
        {categories.map((entry) => {
          const current = entry.id === selected.id;
          const id = partTestId(testId, 'category', entry.id);

          return (
            <div role="listitem" key={entry.id}>
              <button
                type="button"
                data-testid={id}
                data-active={activePath[0] === entry.id}
                aria-pressed={current}
                onPointerEnter={() => setSelectedId(entry.id)}
                onFocus={() => setSelectedId(entry.id)}
                onClick={() => setSelectedId(entry.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-control border px-3 py-2.5 text-left text-ui-sm font-medium focus-visible:outline-2 focus-visible:outline-focus',
                  current
                    ? 'border-transparent bg-accent text-on-brand'
                    : 'border-[var(--navbar-panel-border,var(--color-line))] hover:bg-hover',
                  classNames?.category,
                )}
              >
                <span className="flex min-w-0 flex-1 items-center gap-3 [&_svg]:size-5">
                  <HeaderLabel item={entry.category!} testId={id} />
                </span>
                <KitIcon name="chevronRight" builtin={chevronRight} size={16} />
              </button>
            </div>
          );
        })}
      </div>
      <div
        data-testid={partTestId(testId, 'panel', selected.id)}
        className={cn('grid min-w-0 content-start gap-6', classNames?.panel)}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-heading font-semibold">
            {category.href ? (
              <NavigationMenu.Link asChild>
                <UiLink
                  href={category.href}
                  onClick={onNavigate}
                  className="hover:underline"
                >
                  {category.label}
                </UiLink>
              </NavigationMenu.Link>
            ) : (
              category.label
            )}
          </h2>
          {action && (
            <NavigationMenu.Link asChild>
              <UiLink
                href={action.href ?? '#'}
                onClick={onNavigate}
                data-testid={partTestId(testId, 'action', action.id)}
                className="inline-flex items-center gap-2 rounded-control border border-control-border px-4 py-2 text-ui-sm font-medium hover:bg-hover focus-visible:outline-2 focus-visible:outline-focus"
              >
                {(action.source as { label: React.ReactNode }).label}
                <KitIcon name="arrowRight" builtin={arrowRight} size={16} />
              </UiLink>
            </NavigationMenu.Link>
          )}
        </div>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <Section
              key={section.id}
              node={section}
              activePath={childPath[0] === section.id ? childPath : []}
              testId={testId}
              classNames={classNames}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MegaPanel<TAccess>({
  item,
  fullWidth,
  classNames,
  ...props
}: PanelProps<TAccess>) {
  const anchor = useHeaderAnchor(fullWidth);
  const content =
    item.layout === 'categories' ? (
      <CategoriesPanel {...props} classNames={classNames} />
    ) : (
      <ColumnsPanel {...props} item={item} classNames={classNames} />
    );

  if (!fullWidth)
    return (
      <div
        className={cn(
          'absolute left-0 top-full z-popover mt-2 w-max max-w-[calc(100vw-2rem)]',
          panelClass,
          classNames?.panel,
        )}
      >
        {content}
      </div>
    );

  return (
    // The anchor takes no space in the menu row; the panel is placed against the header.
    <div ref={anchor.ref} className="absolute left-0 top-0 size-0">
      <div
        className={cn(
          'absolute z-popover max-h-[calc(100vh-6rem)] overflow-y-auto',
          !anchor.style && 'invisible',
          panelClass,
          classNames?.panel,
        )}
        style={anchor.style}
      >
        {content}
      </div>
    </div>
  );
}
