import { NavigationMenu } from 'radix-ui';
import { cn, partTestId } from '../../components/common';
import { Icon } from '../../components/icon';
import { UiLink } from '../../components/link-image-provider';
import type { HeaderNode } from './model';
import type { NavbarClassNames, NavbarItem } from './types';

export const rowClass =
  'flex items-center gap-2 rounded-control px-3 py-2 text-ui-sm text-ink hover:bg-hover focus-visible:outline-2 focus-visible:outline-focus data-[active=true]:bg-selected data-[active=true]:text-selected-ink';

export function HeaderLabel<TAccess>({
  item,
  className,
  testId,
}: {
  item: NavbarItem<TAccess>;
  className?: string | undefined;
  testId?: string | undefined;
}) {
  return (
    <>
      {item.icon && (
        <Icon
          {...(typeof item.icon === 'string'
            ? { name: item.icon }
            : { glyph: item.icon })}
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

export function HeaderEntries<TAccess>({
  nodes,
  activePath,
  testId,
  classNames,
  mobile = false,
  topLevel = false,
  onNavigate,
  activeIndicator = 'underline',
}: {
  nodes: readonly HeaderNode<TAccess>[];
  activePath: readonly string[];
  testId: string | undefined;
  classNames: NavbarClassNames | undefined;
  activeIndicator?: 'underline' | 'pill';
  mobile?: boolean;
  topLevel?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      {nodes.map((node) => {
        const id = partTestId(testId, node.section ? 'section' : 'item', node.id);
        const active = activePath[0] === node.id;
        const childPath = active ? activePath.slice(1) : [];
        if (node.section)
          return (
            <section
              key={node.id}
              data-testid={id}
              className={cn('min-w-0 space-y-1', classNames?.section)}
            >
              <h3 className="px-3 py-2 text-ui-sm font-semibold text-muted">
                {node.section.title}
              </h3>
              <HeaderEntries
                nodes={node.items ?? []}
                activePath={childPath}
                testId={id}
                classNames={classNames}
                mobile={mobile}
                {...(onNavigate ? { onNavigate } : {})}
              />
            </section>
          );
        const item = node.source!;
        const underline = topLevel && !mobile && activeIndicator === 'underline';
        const itemRowClass = underline
          ? // Inactive items stay muted so the active (accent, semibold) item reads as the strongest.
            'relative flex h-full min-h-16 items-center gap-2 px-3 py-2 text-ui-sm font-medium text-muted transition-colors hover:text-ink data-[state=open]:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus data-[active=true]:font-semibold data-[active=true]:text-accent'
          : rowClass;
        const indicator =
          underline && active ? (
            <span
              aria-hidden="true"
              data-testid={partTestId(id, 'activeIndicator')}
              className={cn(
                'pointer-events-none absolute inset-x-0 -bottom-px h-0.5 bg-accent',
                classNames?.activeIndicator,
              )}
            />
          ) : null;
        if ('href' in item) {
          const link = (
            <UiLink
              href={item.href}
              data-testid={partTestId(id, 'link')}
              data-active={active}
              aria-current={active ? 'page' : undefined}
              onClick={onNavigate}
              className={cn(itemRowClass, classNames?.link, item.className)}
            >
              <HeaderLabel item={item} className={classNames?.icon} testId={id} />
              {indicator}
            </UiLink>
          );
          const linked = mobile ? (
            link
          ) : (
            <NavigationMenu.Link asChild active={active}>
              {link}
            </NavigationMenu.Link>
          );

          return topLevel ? (
            <NavigationMenu.Item
              key={node.id}
              data-testid={id}
              className={cn('relative flex items-center', classNames?.item)}
            >
              {linked}
            </NavigationMenu.Item>
          ) : (
            <div key={node.id} data-testid={id} className={classNames?.item}>
              {linked}
            </div>
          );
        }
        const content = (
          <HeaderEntries
            nodes={node.items ?? []}
            activePath={childPath}
            testId={id}
            classNames={classNames}
            mobile={mobile}
            {...(onNavigate ? { onNavigate } : {})}
          />
        );
        if (mobile)
          return (
            <details
              key={node.id}
              open={active || undefined}
              data-testid={id}
              className={cn('py-1', classNames?.item, item.className)}
            >
              <summary
                data-testid={partTestId(id, 'trigger')}
                data-active={active}
                className={cn(rowClass, 'cursor-pointer', classNames?.trigger)}
              >
                <HeaderLabel item={item} className={classNames?.icon} testId={id} />
                <Icon name="chevronDown" size={16} />
              </summary>
              <div
                data-testid={partTestId(id, 'content')}
                className={cn('grid gap-1 pl-3', classNames?.content)}
              >
                {content}
              </div>
            </details>
          );

        return (
          <NavigationMenu.Item
            key={node.id}
            value={node.id}
            data-testid={id}
            className={cn(
              'relative flex items-center',
              classNames?.item,
              item.className,
            )}
          >
            <NavigationMenu.Trigger
              data-testid={partTestId(id, 'trigger')}
              data-active={active}
              className={cn(itemRowClass, 'group', classNames?.trigger)}
            >
              <HeaderLabel item={item} className={classNames?.icon} testId={id} />
              <Icon
                name="chevronDown"
                size={16}
                className="group-data-[state=open]:rotate-180"
              />
              {indicator}
            </NavigationMenu.Trigger>
            <NavigationMenu.Content
              data-testid={partTestId(id, 'content')}
              className={cn(
                'absolute left-0 top-full z-popover mt-2 grid w-max max-w-[calc(100vw-2rem)] gap-3 rounded-panel border border-line bg-surface p-3 shadow-floating',
                item.type === 'mega' && 'grid-cols-2',
                classNames?.content,
              )}
            >
              {content}
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        );
      })}
    </>
  );
}
