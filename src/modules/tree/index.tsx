'use client';
import { partTestId, type TestIdProps } from '../../components/common/testing';

import { useUILocale } from '../../i18n/provider';
import { useMemo, useRef, useState } from 'react';
import { type SlotClasses, cn } from '../../components/common';
import { Icon } from '../../components/icon';
import { validateTree, visibleTree, type TreeNode } from './model';
export type { TreeNode } from './model';
export interface TreeProps extends TestIdProps {
  nodes: readonly TreeNode[];
  label: string;
  value?: string;
  onValueChange?: (value: string) => void;
  expanded?: readonly string[];
  onExpandedChange?: (ids: string[]) => void;
  classNames?: SlotClasses<
    'root' | 'item' | 'selectedItem' | 'toggle' | 'icon' | 'label' | 'empty'
  >;
  className?: string;
}

export function Tree({
  'data-testid': testId,
  nodes,
  label,
  value,
  onValueChange,
  expanded: controlledExpanded,
  onExpandedChange,
  className,
  classNames,
}: TreeProps & { 'data-testid'?: string | undefined }) {
  const { t } = useUILocale();
  const [localExpanded, setExpanded] = useState<string[]>([]);
  const expanded = controlledExpanded ?? localExpanded;
  const [localValue, setValue] = useState<string>();
  const selected = value ?? localValue;
  const [active, setActive] = useState<string>();
  const refs = useRef(new Map<string, HTMLDivElement>());
  const rows = useMemo(() => {
    validateTree(nodes);

    return visibleTree(nodes, expanded);
  }, [nodes, expanded]);
  const enabled = rows.filter((row) => !row.node.disabled);
  const activeId = enabled.some(({ node }) => node.id === active)
    ? active
    : enabled.some(({ node }) => node.id === selected)
      ? selected
      : enabled[0]?.node.id;

  function toggle(id: string) {
    const next = expanded.includes(id)
      ? expanded.filter((key) => key !== id)
      : [...expanded, id];
    setExpanded(next);
    onExpandedChange?.(next);
  }

  function focus(id?: string) {
    if (id) {
      setActive(id);
      refs.current.get(id)?.focus();
    }
  }

  return (
    <div
      data-testid={testId}
      role="tree"
      aria-label={label}
      className={cn('grid gap-1', classNames?.root, className)}
    >
      {rows.map(({ node, level, parentId, position, siblings }) => (
        <div
          data-testid={partTestId(testId, 'item', node.id)}
          key={node.id}
          ref={(element) => {
            if (element) refs.current.set(node.id, element);
            else refs.current.delete(node.id);
          }}
          role="treeitem"
          aria-level={level}
          aria-posinset={position}
          aria-setsize={siblings}
          aria-selected={selected === node.id}
          aria-disabled={node.disabled}
          {...(node.children?.length
            ? { 'aria-expanded': expanded.includes(node.id) }
            : {})}
          tabIndex={activeId === node.id ? 0 : -1}
          onFocus={() => setActive(node.id)}
          onClick={() => {
            if (!node.disabled) {
              setValue(node.id);
              onValueChange?.(node.id);
              focus(node.id);
            }
          }}
          onKeyDown={(event) => {
            const index = enabled.findIndex((row) => row.node.id === node.id);
            if (
              [
                'ArrowDown',
                'ArrowUp',
                'Home',
                'End',
                'ArrowLeft',
                'ArrowRight',
                ' ',
                'Enter',
              ].includes(event.key)
            )
              event.preventDefault();
            if (event.key === 'ArrowDown') focus(enabled[index + 1]?.node.id);
            if (event.key === 'ArrowUp') focus(enabled[index - 1]?.node.id);
            if (event.key === 'Home') focus(enabled[0]?.node.id);
            if (event.key === 'End') focus(enabled.at(-1)?.node.id);
            if (event.key === 'ArrowRight' && node.children?.length) {
              if (!expanded.includes(node.id)) toggle(node.id);
              else focus(enabled[index + 1]?.node.id);
            }
            if (event.key === 'ArrowLeft') {
              if (expanded.includes(node.id)) toggle(node.id);
              else focus(parentId ?? undefined);
            }
            if ((event.key === ' ' || event.key === 'Enter') && !node.disabled) {
              setValue(node.id);
              onValueChange?.(node.id);
            }
          }}
          style={{ paddingLeft: `${(level - 1) * 20 + 8}px` }}
          className={cn(
            'flex min-h-9 cursor-default items-center gap-2 rounded-control pr-3 text-control outline-none focus-visible:ring-2 focus-visible:ring-focus',
            selected === node.id ? 'bg-selected text-ink' : 'hover:bg-hover',
            node.disabled && 'opacity-40',
            classNames?.item,
            selected === node.id && classNames?.selectedItem,
          )}
        >
          {node.children?.length ? (
            <button
              data-testid={partTestId(testId, 'toggle', node.id)}
              tabIndex={-1}
              type="button"
              disabled={node.disabled}
              aria-label={t(
                expanded.includes(node.id) ? 'tree.collapse' : 'tree.expand',
                { label: node.label },
              )}
              onClick={(event) => {
                event.stopPropagation();
                toggle(node.id);
                focus(node.id);
              }}
              className={cn(
                'inline-flex size-6 items-center justify-center rounded hover:bg-hover-strong',
                classNames?.toggle,
              )}
            >
              <Icon
                data-testid={partTestId(testId, 'toggleIcon', node.id)}
                name={expanded.includes(node.id) ? 'chevronDown' : 'chevronRight'}
                size={14}
                className={classNames?.icon}
              />
            </button>
          ) : (
            <span className="w-6" />
          )}
          {node.icon ?? (
            <Icon
              data-testid={partTestId(testId, 'icon', node.id)}
              name={expanded.includes(node.id) ? 'folderOpen' : 'folder'}
              className={classNames?.icon}
            />
          )}
          <span
            data-testid={partTestId(testId, 'label', node.id)}
            className={classNames?.label}
          >
            {node.label}
          </span>
        </div>
      ))}
      {!rows.length && (
        <p
          data-testid={partTestId(testId, 'empty')}
          className={cn('p-3 text-ui-sm text-muted', classNames?.empty)}
        >
          {t('tree.empty')}
        </p>
      )}
    </div>
  );
}
