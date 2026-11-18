import { useRef, useState, type ReactNode } from 'react';
import { cn, partTestId } from '../../components/common';
import { KitIcon } from '../../components/icon/kit-icon';
import { ChevronLeftIcon } from '../../components/icon/outline/chevron-left';
import { ChevronLeftIcon as ChevronLeftBoldIcon } from '../../components/icon/bold/chevron-left';
import { ChevronRightIcon } from '../../components/icon/outline/chevron-right';
import { ChevronRightIcon as ChevronRightBoldIcon } from '../../components/icon/bold/chevron-right';
import { UiLink } from '../../components/link-image-provider';
import { useUILocale } from '../../i18n/provider';
import { HeaderLabel, rowClass } from './entries';
import type { HeaderNode } from './model';
import type { NavbarClassNames, NavbarItem } from './types';

type Level<TAccess> = {
  node: HeaderNode<TAccess>;
  path: readonly string[];
  testId: string | undefined;
};

function labelOf<TAccess>(node: HeaderNode<TAccess>): ReactNode {
  return node.category?.label ?? node.section?.title ?? node.source?.label;
}

/** Only dropdowns and mega categories open a new level; sections stay grouped on one screen. */
function opensLevel<TAccess>(node: HeaderNode<TAccess>) {
  return Boolean(node.items?.length) && !node.section && node.role !== 'footer';
}

/**
 * Drawer navigation that goes one level deeper at a time, with a back button, so deep
 * menus stay readable on a phone. Rows on the current page's branch are marked active.
 */
export function MobileMenu<TAccess>({
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
  onNavigate?: () => void;
}) {
  const { t } = useUILocale();
  // Open on the current page's branch, as deep as it goes one level at a time.
  const [stack, setStack] = useState<Level<TAccess>[]>(() => {
    const levels: Level<TAccess>[] = [];
    let siblings = nodes;
    let parentId = testId;

    for (const [index, id] of activePath.entries()) {
      const node = siblings.find((entry) => entry.id === id);
      if (!node || !opensLevel(node)) break;

      parentId = partTestId(parentId, 'item', node.id);
      levels.push({ node, path: activePath.slice(0, index + 1), testId: parentId });
      siblings = node.items ?? [];
    }

    return levels;
  });
  const list = useRef<HTMLDivElement>(null);
  const current = stack.at(-1);
  const level = current?.node.items ?? nodes;
  const basePath = current?.path ?? [];
  const levelId = current?.testId ?? testId;

  const isActive = (path: readonly string[]) =>
    path.length > 0 && path.every((id, index) => activePath[index] === id);

  const focusFirst = () =>
    requestAnimationFrame(() =>
      list.current?.querySelector<HTMLElement>('a, button')?.focus(),
    );

  const open = (
    node: HeaderNode<TAccess>,
    path: readonly string[],
    id: string | undefined,
  ) => {
    setStack((levels) => [...levels, { node, path, testId: id }]);

    focusFirst();
  };

  const back = () => {
    setStack((levels) => levels.slice(0, -1));

    focusFirst();
  };

  const link = (
    node: HeaderNode<TAccess>,
    path: readonly string[],
    parentId: string | undefined,
    className?: string,
  ) => {
    const id = partTestId(parentId, 'item', node.id);
    const active = isActive(path);

    return (
      <div key={node.id} data-testid={id} className={classNames?.item}>
        <UiLink
          href={node.href ?? '#'}
          data-testid={partTestId(id, 'link')}
          data-active={active}
          aria-current={active ? 'page' : undefined}
          onClick={onNavigate}
          className={cn(rowClass, classNames?.link, className)}
        >
          <HeaderLabel
            item={node.category ?? (node.source as NavbarItem<TAccess>)}
            className={classNames?.icon}
            testId={id}
          />
        </UiLink>
      </div>
    );
  };

  const entry = (node: HeaderNode<TAccess>): ReactNode => {
    const path = [...basePath, node.id];
    const id = partTestId(levelId, node.section ? 'section' : 'item', node.id);

    if (node.section || node.role === 'footer')
      return (
        <section
          key={node.id}
          data-testid={id}
          className={cn('grid gap-1 pt-3', classNames?.section)}
        >
          {node.section && (
            <h3 className="px-3 pb-1 text-ui-sm font-semibold text-muted">
              {node.section.title}
            </h3>
          )}
          {(node.items ?? []).map((child) =>
            link(
              child,
              [...path, child.id],
              id,
              child.role === 'more' ? 'font-medium' : undefined,
            ),
          )}
        </section>
      );

    if (opensLevel(node)) {
      const active = isActive(path);

      return (
        <div key={node.id} data-testid={id} className={classNames?.item}>
          <button
            type="button"
            data-testid={partTestId(id, 'trigger')}
            data-active={active}
            onClick={() => open(node, path, id)}
            className={cn(rowClass, 'w-full justify-between', classNames?.trigger)}
          >
            <span className="flex min-w-0 items-center gap-2">
              <HeaderLabel
                item={node.category ?? (node.source as NavbarItem<TAccess>)}
                className={classNames?.icon}
                testId={id}
              />
            </span>
            <KitIcon
              name="chevronRight"
              builtin={{ outline: ChevronRightIcon, bold: ChevronRightBoldIcon }}
              size={16}
            />
          </button>
        </div>
      );
    }

    return link(node, path, levelId);
  };

  return (
    <div ref={list} className="grid gap-1">
      {current && (
        <div className="mb-2 grid gap-2 border-b border-line pb-3">
          <button
            type="button"
            data-testid={partTestId(testId, 'back')}
            onClick={back}
            className={cn(rowClass, 'w-fit text-muted', classNames?.back)}
          >
            <KitIcon
              name="chevronLeft"
              builtin={{ outline: ChevronLeftIcon, bold: ChevronLeftBoldIcon }}
              size={16}
            />
            {stack.length > 1
              ? t('navbar.back', { label: String(labelOf(stack.at(-2)!.node) ?? '') })
              : t('navbar.backToMenu')}
          </button>
          <p className="px-3 font-semibold text-ink">{labelOf(current.node)}</p>
          {current.node.category?.href &&
            link(
              { ...current.node, items: [] } as HeaderNode<TAccess>,
              current.path,
              testId,
            )}
        </div>
      )}
      {level.map(entry)}
    </div>
  );
}
