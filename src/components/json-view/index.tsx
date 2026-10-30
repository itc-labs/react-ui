'use client';

import {
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
} from 'react';
import { cn, partTestId, type SlotClasses, type TestIdProps } from '../common';
import { focusRingClassName } from '../common/focus-ring';
import { useCopy } from '../common/use-copy';
import { useUILocale } from '../../i18n/provider';
import { KitIcon } from '../icon/kit-icon';
import { ChevronRightIcon } from '../icon/outline/chevron-right';
import { ChevronRightIcon as ChevronRightBoldIcon } from '../icon/bold/chevron-right';
import { CopyIcon } from '../icon/outline/copy';
import { CopyIcon as CopyBoldIcon } from '../icon/bold/copy';
import { copyJson, jsonNode, type JsonNode } from './model';

export type JsonViewClassNames = SlotClasses<
  | 'root'
  | 'header'
  | 'copyButton'
  | 'status'
  | 'tree'
  | 'item'
  | 'toggle'
  | 'key'
  | 'value'
  | 'count'
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'other'
>;
export interface JsonViewProps
  extends
    Omit<ComponentPropsWithRef<'div'>, 'children' | 'data' | 'className'>,
    TestIdProps {
  data: unknown;
  /** Root is depth zero. true expands all containers. */
  defaultExpandDepth?: number | true;
  rootName?: string;
  sortKeys?: boolean;
  /** Maximum visible string characters before an inline expansion control. */
  collapseStringsAfter?: number;
  copyable?: boolean;
  maxHeight?: CSSProperties['maxHeight'];
  className?: string;
  classNames?: JsonViewClassNames;
}

const colors = {
  string: 'text-success-700',
  number: 'text-info-700',
  boolean: 'text-warning-700',
  null: 'text-muted',
  other: 'text-muted',
  object: '',
  array: '',
};
const chevron = { outline: ChevronRightIcon, bold: ChevronRightBoldIcon };
const copyIcon = { outline: CopyIcon, bold: CopyBoldIcon };

export function JsonView({
  data,
  defaultExpandDepth = 1,
  rootName,
  sortKeys,
  collapseStringsAfter,
  copyable = true,
  maxHeight,
  className,
  classNames,
  'data-testid': testId,
  'aria-label': ariaLabel,
  ...props
}: JsonViewProps) {
  const { t } = useUILocale();
  const { copy, copied } = useCopy();
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState('$');
  const refs = useRef(new Map<string, HTMLDivElement>());
  const rows: {
    node: JsonNode;
    depth: number;
    parent?: string;
    position: number;
    siblings: number;
    expandable: boolean;
    open: boolean;
  }[] = [];
  const limit =
    collapseStringsAfter === undefined ? Infinity : Math.max(0, collapseStringsAfter);

  function visit(
    node: JsonNode,
    depth: number,
    position: number,
    siblings: number,
    parent?: string,
  ) {
    const container = !!node.children?.length;
    const expandable =
      container || (node.kind === 'string' && node.text.length > limit);
    const open =
      overrides[node.id] ??
      (container && (defaultExpandDepth === true || depth < defaultExpandDepth));
    rows.push({
      node,
      depth,
      position,
      siblings,
      expandable,
      open,
      ...(parent === undefined ? {} : { parent }),
    });
    if (container && open)
      node.children!.forEach((child, index) =>
        visit(child, depth + 1, index + 1, node.children!.length, node.id),
      );
  }

  visit(jsonNode(data, sortKeys), 0, 1, 1);
  const activeId = rows.some(({ node }) => node.id === active) ? active : '$';

  function focus(id?: string) {
    if (id) refs.current.get(id)?.focus();
  }

  function toggle(id: string, open: boolean) {
    setOverrides((previous) => ({ ...previous, [id]: !open }));
  }

  return (
    <div
      {...props}
      data-testid={testId}
      className={cn(
        'rounded-panel border border-line bg-surface font-mono text-control text-ink',
        classNames?.root,
        className,
      )}
    >
      <div
        data-testid={partTestId(testId, 'header')}
        className={cn(
          'flex items-center justify-between gap-3 border-b border-line px-3 py-2',
          classNames?.header,
        )}
      >
        <span>{rootName ?? t('jsonView.label')}</span>
        {copyable && (
          <button
            type="button"
            data-testid={partTestId(testId, 'copy')}
            className={cn(
              'inline-flex items-center gap-2 rounded-control px-2 py-1 text-muted hover:bg-hover hover:text-ink',
              focusRingClassName,
              classNames?.copyButton,
            )}
            onClick={() => void copy(copyJson(data))}
          >
            <KitIcon name="copy" builtin={copyIcon} size={16} />
            {t(copied ? 'copy.copied' : 'copy.label')}
          </button>
        )}
      </div>
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid={partTestId(testId, 'status')}
        className={cn('sr-only', classNames?.status)}
      >
        {copied ? t('copy.copied') : ''}
      </span>
      <div
        role="tree"
        aria-label={ariaLabel ?? rootName ?? t('jsonView.label')}
        data-testid={partTestId(testId, 'tree')}
        style={{ maxHeight }}
        className={cn('overflow-auto p-2', classNames?.tree)}
      >
        {rows.map(
          ({ node, depth, parent, position, siblings, expandable, open }, index) => (
            <div
              key={node.id}
              role="treeitem"
              aria-level={depth + 1}
              aria-posinset={position}
              aria-setsize={siblings}
              aria-expanded={expandable ? open : undefined}
              tabIndex={activeId === node.id ? 0 : -1}
              ref={(element) => {
                if (element) refs.current.set(node.id, element);
                else refs.current.delete(node.id);
              }}
              data-testid={partTestId(testId, 'item', node.id)}
              style={{ paddingLeft: `${depth * 20 + 4}px` }}
              className={cn(
                'flex min-h-8 w-max min-w-full items-start gap-1 rounded-control pr-2 outline-offset-[-2px] hover:bg-hover',
                focusRingClassName,
                classNames?.item,
              )}
              onFocus={() => setActive(node.id)}
              onClick={() => focus(node.id)}
              onKeyDown={(event) => {
                if (
                  ![
                    'ArrowDown',
                    'ArrowUp',
                    'Home',
                    'End',
                    'ArrowLeft',
                    'ArrowRight',
                    'Enter',
                    ' ',
                  ].includes(event.key)
                )
                  return;
                event.preventDefault();
                if (event.key === 'ArrowDown') focus(rows[index + 1]?.node.id);
                if (event.key === 'ArrowUp') focus(rows[index - 1]?.node.id);
                if (event.key === 'Home') focus(rows[0]?.node.id);
                if (event.key === 'End') focus(rows.at(-1)?.node.id);
                if (event.key === 'ArrowRight' && expandable) {
                  if (!open) toggle(node.id, open);
                  else if (node.children?.length) focus(rows[index + 1]?.node.id);
                }
                if (event.key === 'ArrowLeft') {
                  if (expandable && open) toggle(node.id, open);
                  else focus(parent);
                }
                if ((event.key === 'Enter' || event.key === ' ') && expandable)
                  toggle(node.id, open);
              }}
            >
              {expandable ? (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={t(open ? 'jsonView.collapse' : 'jsonView.expand', {
                    label: node.key ?? rootName ?? t('jsonView.label'),
                  })}
                  data-testid={partTestId(testId, 'toggle', node.id)}
                  className={cn(
                    'inline-flex size-6 shrink-0 items-center justify-center rounded-control',
                    focusRingClassName,
                    classNames?.toggle,
                  )}
                  onClick={() => {
                    toggle(node.id, open);
                    focus(node.id);
                  }}
                >
                  <KitIcon
                    name="chevronRight"
                    builtin={chevron}
                    size={14}
                    className={cn(open && 'rotate-90')}
                  />
                </button>
              ) : (
                <span className="size-6 shrink-0" />
              )}
              <span className="py-0.5">
                {(node.key !== undefined || rootName !== undefined) && (
                  <span
                    data-testid={partTestId(testId, 'key', node.id)}
                    className={classNames?.key}
                  >
                    {JSON.stringify(node.key ?? rootName)}:{' '}
                  </span>
                )}
                {node.children ? (
                  <span
                    data-testid={partTestId(testId, 'count', node.id)}
                    className={cn('text-muted', classNames?.count)}
                  >
                    {node.kind === 'array'
                      ? `[${node.children.length}]`
                      : `{${node.children.length}}`}
                  </span>
                ) : (
                  <span
                    data-testid={partTestId(testId, 'value', node.id)}
                    className={cn(
                      colors[node.kind],
                      node.kind !== 'object' &&
                        node.kind !== 'array' &&
                        classNames?.[node.kind],
                      classNames?.value,
                    )}
                  >
                    {node.kind === 'string'
                      ? JSON.stringify(
                          expandable && !open
                            ? `${node.text.slice(0, limit)}…`
                            : node.text,
                        )
                      : node.text}
                  </span>
                )}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
