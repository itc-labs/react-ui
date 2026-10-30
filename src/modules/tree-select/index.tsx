'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  cn,
  controlBase,
  controlSizes,
  fieldDescription,
  partTestId,
} from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import { valueControl } from '../../components/common/form-control';
import { KitIcon } from '../../components/icon/kit-icon';
import { ChevronDownIcon } from '../../components/icon/outline/chevron-down';
import { ChevronDownIcon as ChevronDownBoldIcon } from '../../components/icon/bold/chevron-down';
import { ChevronRightIcon } from '../../components/icon/outline/chevron-right';
import { ChevronRightIcon as ChevronRightBoldIcon } from '../../components/icon/bold/chevron-right';
import { CheckIcon } from '../../components/icon/outline/check';
import { CheckIcon as CheckBoldIcon } from '../../components/icon/bold/check';
import { MinusIcon } from '../../components/icon/outline/minus';
import { MinusIcon as MinusBoldIcon } from '../../components/icon/bold/minus';
import { CloseIcon } from '../../components/icon/outline/close';
import { CloseIcon as CloseBoldIcon } from '../../components/icon/bold/close';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/popover';
import { Spinner } from '../../components/spinner';
import { useDebouncedCallback } from '../../hooks/use-debounced-callback';
import { useUILocale } from '../../i18n/provider';
import {
  ancestors,
  buildModel,
  cascadeState,
  isBranch,
  matchRange,
  normalize,
  serialize,
  type Entry,
} from './model';
import type { TreeSelectOption, TreeSelectProps } from './types';

export type {
  TreeSelectNode,
  TreeSelectOption,
  TreeSelectNodeState,
  TreeSelectClassNames,
  TreeSelectProps,
  SingleTreeSelectProps,
  MultiTreeSelectProps,
} from './types';
const icons = {
  check: { outline: CheckIcon, bold: CheckBoldIcon },
  minus: { outline: MinusIcon, bold: MinusBoldIcon },
  chevronDown: { outline: ChevronDownIcon, bold: ChevronDownBoldIcon },
  chevronRight: { outline: ChevronRightIcon, bold: ChevronRightBoldIcon },
  close: { outline: CloseIcon, bold: CloseBoldIcon },
};
type Row =
  | { key: string; entry: Entry }
  | { key: string; action: 'more' | 'retry'; parent: string | null; level: number };

export function TreeSelect(props: TreeSelectProps) {
  const { t } = useUILocale();
  const {
    nodes,
    multiple,
    disabled,
    label,
    hint,
    error,
    name,
    required,
    className,
    classNames: classes,
    size = 'md',
    searchable,
    searchLoading,
    'data-testid': testId,
  } = props;
  const generated = useId();
  const id = props.id ?? generated;
  const treeId = `${id}-tree`;
  const [localValue, setLocalValue] = useState<string | null | readonly string[]>(
    props.defaultValue ?? (multiple ? [] : null),
  );
  const value = props.value !== undefined ? props.value : localValue;
  const ids: readonly string[] = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? [value]
      : [];
  const signature = JSON.stringify(ids);
  const model = useMemo(
    () => buildModel(props),
    [nodes, props.disabledSubtreeIds, props.isNodeDisabled, props.selectableLevels],
  );
  const retained = useRef(new Map<string, TreeSelectOption>());

  useEffect(() => {
    for (const [key, entry] of model)
      retained.current.set(key, { id: key, label: entry.node.label, path: entry.path });
  }, [model]);

  const selectedOptions = useMemo(
    () =>
      new Map([
        ...retained.current,
        ...(props.selectedOptions ?? []).map((option) => [option.id, option] as const),
        ...[...model].map(
          ([key, entry]) =>
            [key, { id: key, label: entry.node.label, path: entry.path }] as const,
        ),
      ]),
    [model, props.selectedOptions],
  );
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<string>();
  const [query, setQuery] = useState('');
  const [pendingSearch, setPendingSearch] = useState(false);
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [failures, setFailures] = useState<Set<string>>(new Set());
  const inFlight = useRef(new Set<string>());
  const mounted = useRef(true);

  const checkedBranches = (values: readonly string[]) =>
    [...cascadeState(values, model).checked].filter((key) => {
      const entry = model.get(key);

      return entry && isBranch(entry.node);
    });

  const [intents, setIntents] = useState<string[]>(() =>
    props.multiple && props.cascade ? checkedBranches(ids) : [],
  );
  const lastOutput = useRef(signature);

  useEffect(() => {
    if (signature !== lastOutput.current) setIntents(checkedBranches(ids));
    lastOutput.current = signature;
  }, [signature]);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const cascade = Boolean(multiple && props.cascade);
  const state = useMemo(
    () =>
      cascadeState(
        [...ids, ...(signature === lastOutput.current ? intents : [])],
        model,
      ),
    [signature, intents, model],
  );
  const searchRef = useRef<HTMLInputElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const composing = useRef(false);
  const lastSearch = useRef('');
  const notifySearch = useDebouncedCallback((text: string) => {
    setPendingSearch(false);
    if (text !== lastSearch.current) {
      lastSearch.current = text;
      props.onSearchChange?.(text);
    }
  }, props.searchDebounceMs ?? 300);

  function search(text: string) {
    setQuery(text);
    setActive(undefined);
    notifySearch.cancel();
    if (props.onSearchChange) {
      setPendingSearch(Boolean(text));
      if (!text) {
        setPendingSearch(false);
        if (lastSearch.current) {
          lastSearch.current = '';
          props.onSearchChange('');
        }
      } else if (!composing.current) notifySearch(text);
    }
  }

  useEffect(() => {
    setPendingSearch(false);
  }, [notifySearch]);

  const hasSearchHandler = Boolean(props.onSearchChange);

  useEffect(() => {
    if (!hasSearchHandler) {
      notifySearch.cancel();
      setPendingSearch(false);
    }
    if (disabled || !searchable) {
      notifySearch.cancel();
      setPendingSearch(false);
      setOpen(false);
    }
  }, [disabled, searchable, hasSearchHandler, notifySearch]);

  const filtering = Boolean(query && !props.onSearchChange);
  const visible = useMemo(() => {
    if (!filtering) return null;
    const keep = new Set<string>();
    for (const [key, entry] of model) {
      if (normalize(entry.node.label).includes(normalize(query))) {
        keep.add(key);
        for (const parent of ancestors(key, model)) keep.add(parent);
      }
    }

    return keep;
  }, [filtering, query, model]);
  const rows = useMemo(() => {
    const result: Row[] = [];

    const visit = (
      children: typeof nodes,
      parent: string | null,
      level: number,
      more: boolean,
    ) => {
      const kept = children.filter((node) => !visible || visible.has(node.id));

      kept.forEach((node, index) => {
        const entry = {
          ...model.get(node.id)!,
          position: index + 1,
          siblings: kept.length,
        };
        result.push({ key: `node:${node.id}`, entry });
        if (expanded.has(node.id) || filtering) {
          visit(node.children ?? [], node.id, level + 1, Boolean(node.hasMore));
          if (failures.has(node.id))
            result.push({
              key: `retry:${node.id}`,
              action: 'retry',
              parent: node.id,
              level: level + 1,
            });
        }
      });

      if (more && props.onLoadMore && !filtering)
        result.push({
          key: parent === null ? 'more:root' : `more:node:${parent}`,
          action: 'more',
          parent,
          level,
        });
    };

    visit(nodes, null, 1, Boolean(props.hasMore));

    return result;
  }, [
    nodes,
    model,
    visible,
    expanded,
    filtering,
    failures,
    props.hasMore,
    props.onLoadMore,
  ]);

  const rowDisabled = (row: Row) =>
    'entry' in row
      ? row.entry.disabled
      : Boolean(
          searchLoading ||
          pendingSearch ||
          props.loadingIds?.includes(row.parent) ||
          (row.parent !== null &&
            (loading.has(row.parent) || model.get(row.parent)?.disabled)),
        );

  const enabled = rows.filter((row) => !rowDisabled(row));
  const activeKey = enabled.some((row) => row.key === active)
    ? active
    : enabled[0]?.key;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 40,
    overscan: 6,
    getItemKey: (index) => rows[index]!.key,
    initialRect: { width: 256, height: 280 },
  });
  const items = virtualizer.getVirtualItems();
  const busy = Boolean(searchLoading || pendingSearch);

  const loadingLevel = (parent: string | null) =>
    Boolean(props.loadingIds?.includes(parent));

  const rootRequested = useRef<string | undefined>(undefined);
  const pagingKey = `${query}:${nodes.map((node) => node.id).join(',')}`;
  const lastIndex = virtualizer.range?.endIndex ?? -1;

  useEffect(() => {
    if (
      open &&
      !busy &&
      props.hasMore &&
      props.onLoadMore &&
      !loadingLevel(null) &&
      lastIndex === rows.length - 1 &&
      rows.at(-1)?.key === 'more:root' &&
      rootRequested.current !== pagingKey
    ) {
      rootRequested.current = pagingKey;
      props.onLoadMore(null);
    }
  }, [
    open,
    busy,
    lastIndex,
    rows,
    props.hasMore,
    props.onLoadMore,
    props.loadingIds,
    pagingKey,
  ]);

  useEffect(() => {
    if (!props.hasMore) rootRequested.current = undefined;
  }, [props.hasMore]);

  useEffect(() => {
    if (!open) return;
    const index = rows.findIndex((row) => row.key === activeKey);
    if (index >= 0) virtualizer.scrollToIndex(index, { align: 'auto' });
  }, [activeKey, open, rows]);

  function changeOpen(next: boolean) {
    if (disabled) return;
    setOpen(next);
    if (next) {
      setExpanded(
        (previous) =>
          new Set([...previous, ...ids.flatMap((key) => ancestors(key, model))]),
      );

      setActive(ids.map((key) => `node:${key}`).find((key) => model.has(key.slice(5))));
    } else {
      if (query) search('');
    }
  }

  async function load(entry: Entry) {
    if (!props.loadChildren || inFlight.current.has(entry.node.id)) return;
    const key = entry.node.id;
    inFlight.current.add(key);

    setLoading((previous) => new Set(previous).add(key));

    setFailures((previous) => {
      const next = new Set(previous);
      next.delete(key);

      return next;
    });

    try {
      await props.loadChildren(entry.node);
    } catch {
      if (mounted.current) setFailures((previous) => new Set(previous).add(key));
    } finally {
      inFlight.current.delete(key);
      if (mounted.current)
        setLoading((previous) => {
          const next = new Set(previous);
          next.delete(key);

          return next;
        });
    }
  }

  function expand(entry: Entry) {
    const key = entry.node.id;
    if (entry.disabled) return;

    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);

      return next;
    });

    if (!expanded.has(key) && entry.node.hasChildren && !entry.node.children)
      void load(entry);
  }

  function emit(next: string[]) {
    lastOutput.current = JSON.stringify(next);
    if (multiple) {
      setLocalValue(next);
      props.onValueChange?.(next);
    } else {
      setLocalValue(next[0] ?? null);
      props.onValueChange?.(next[0] ?? null);
    }
  }

  const previousModel = useRef(model);

  useEffect(() => {
    const changed = previousModel.current !== model;
    previousModel.current = model;
    if (!changed || !cascade) return;
    const checked = new Set(state.checked);
    for (const key of ids) if (!model.has(key)) checked.add(key);
    const next = serialize(checked, model, props.checkedStrategy ?? 'parent');
    if (next.length !== ids.length || next.some((key) => !ids.includes(key)))
      emit(next);
  }, [model, cascade, props.checkedStrategy]);

  function pick(key: string) {
    const entry = model.get(key);
    if (disabled || (entry && !entry.selectable)) return;
    if (!multiple) {
      emit([key]);
      changeOpen(false);

      return;
    }
    if (!cascade || !entry) {
      emit(ids.includes(key) ? ids.filter((id) => id !== key) : [...ids, key]);

      return;
    }
    const checked = new Set(state.checked);
    // Unknown selected IDs survive changes to the currently loaded branch.
    for (const id of ids) if (!model.has(id)) checked.add(id);
    const removing = checked.has(key);
    const affected = [
      key,
      ...[...model.keys()].filter((id) => ancestors(id, model).includes(key)),
    ];
    for (const id of affected) {
      if (removing) checked.delete(id);
      else if (model.get(id)?.selectable) checked.add(id);
    }
    if (removing) for (const parent of ancestors(key, model)) checked.delete(parent);
    const aggregate = cascadeState([...checked], model).checked;
    for (const id of checked) if (!model.has(id)) aggregate.add(id);
    setIntents(
      [...aggregate].filter((id) => {
        const entry = model.get(id);

        return entry && isBranch(entry.node);
      }),
    );
    emit(serialize(aggregate, model, props.checkedStrategy ?? 'parent'));
  }

  function remove(key: string) {
    if (cascade && model.has(key)) pick(key);
    else emit(ids.filter((id) => id !== key));
  }

  function clear() {
    setIntents([]);
    emit([]);
  }

  const typeahead = useRef({ text: '', time: 0 });

  function keyboard(event: KeyboardEvent) {
    if (event.nativeEvent.isComposing || event.defaultPrevented) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      if (query) search('');
      else changeOpen(false);

      return;
    }
    const index = enabled.findIndex((row) => row.key === activeKey);
    const current = rows.find((row) => row.key === activeKey);
    const entry = current && 'entry' in current ? current.entry : undefined;
    let next: Row | undefined;
    if (
      [
        'ArrowDown',
        'ArrowUp',
        'ArrowLeft',
        'ArrowRight',
        'Home',
        'End',
        'Enter',
        ' ',
      ].includes(event.key) &&
      !(searchable && event.key === ' ')
    )
      event.preventDefault();
    if (event.key === 'ArrowDown')
      next = enabled[Math.min(index + 1, enabled.length - 1)];
    if (event.key === 'ArrowUp') next = enabled[Math.max(0, index - 1)];
    if (event.key === 'Home') next = enabled[0];
    if (event.key === 'End') next = enabled.at(-1);
    if (entry && event.key === 'ArrowRight' && isBranch(entry.node)) {
      if (!expanded.has(entry.node.id) && !filtering) expand(entry);
      else
        next = enabled.find(
          (row) => 'entry' in row && row.entry.parent === entry.node.id,
        );
    }
    if (current && !('entry' in current) && event.key === 'ArrowLeft')
      next = enabled.find(
        (row) => 'entry' in row && row.entry.node.id === current.parent,
      );
    if (
      current &&
      !('entry' in current) &&
      (event.key === 'Enter' || (!searchable && event.key === ' '))
    ) {
      if (current.action === 'retry') void load(model.get(current.parent!)!);
      else props.onLoadMore?.(current.parent);
    }
    if (entry && event.key === 'ArrowLeft') {
      if (expanded.has(entry.node.id) && !filtering) expand(entry);
      else
        next = enabled.find(
          (row) => 'entry' in row && row.entry.node.id === entry.parent,
        );
    }
    if (entry && (event.key === 'Enter' || (!searchable && event.key === ' '))) {
      if (entry.selectable) pick(entry.node.id);
      else if (isBranch(entry.node)) expand(entry);
    }
    if (
      !searchable &&
      event.key.length === 1 &&
      event.key !== ' ' &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      const previous = typeahead.current;
      const text =
        Date.now() - previous.time < 700 ? previous.text + event.key : event.key;
      typeahead.current = { text, time: Date.now() };
      const ordered = [...enabled.slice(index + 1), ...enabled.slice(0, index + 1)];
      next = ordered.find(
        (row) =>
          'entry' in row && normalize(row.entry.node.label).startsWith(normalize(text)),
      );
    }
    if (next) setActive(next.key);
  }

  const rowId = (key: string) => `${treeId}-${encodeURIComponent(key)}`;

  const activeDescendant =
    items.some((item) => rows[item.index]?.key === activeKey) && activeKey
      ? rowId(activeKey)
      : undefined;

  const display = (key: string) => {
    const option = selectedOptions.get(key);
    if (!option) return key;

    return props.showPath && !multiple
      ? [...(option.path ?? []), option.label].join(' / ')
      : option.label;
  };

  const glyph = (icon: keyof typeof icons) => (
    <KitIcon name={icon} builtin={icons[icon]} size={14} />
  );

  return (
    <div
      data-testid={partTestId(testId, 'root')}
      className={cn('grid min-w-0 content-start gap-1.5', classes?.root)}
    >
      {label != null && (
        <label
          id={`${id}-label`}
          data-testid={partTestId(testId, 'label')}
          htmlFor={id}
          onClick={() => document.getElementById(id)?.focus()}
          className={cn('text-ui-sm font-medium text-ink', classes?.label)}
        >
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-danger-700">
              *
            </span>
          )}
        </label>
      )}
      <Popover open={open && !disabled} onOpenChange={changeOpen}>
        <PopoverTrigger asChild>
          <div
            id={id}
            ref={props.ref}
            role="combobox"
            aria-haspopup="tree"
            aria-expanded={open && !disabled}
            aria-controls={open ? treeId : undefined}
            aria-disabled={disabled}
            aria-required={required}
            aria-invalid={Boolean(error) || props['aria-invalid']}
            aria-describedby={fieldDescription(
              id,
              Boolean(error),
              Boolean(hint),
              props['aria-describedby'],
            )}
            aria-labelledby={label != null ? `${id}-label` : undefined}
            aria-label={
              props['aria-label'] ?? (label == null ? t('treeSelect.label') : undefined)
            }
            tabIndex={disabled ? -1 : 0}
            data-testid={testId}
            onBlur={props.onBlur}
            onFocus={props.onFocus}
            onKeyDown={(event) => {
              if (
                !disabled &&
                ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)
              ) {
                event.preventDefault();
                changeOpen(true);
              }
            }}
            className={cn(
              controlBase,
              controlSizes[size],
              'flex cursor-pointer items-center gap-2',
              size === 'sm'
                ? 'min-h-control-sm'
                : size === 'lg'
                  ? 'min-h-control-lg'
                  : 'min-h-control-md',
              'h-auto py-1',
              focusRingClassName,
              disabled && 'pointer-events-none bg-canvas opacity-60',
              classes?.control,
              className,
            )}
          >
            <span
              data-testid={partTestId(testId, 'value')}
              className={cn(
                'flex min-w-0 flex-1 flex-wrap items-center gap-1',
                classes?.value,
              )}
            >
              {!ids.length ? (
                <span
                  data-testid={partTestId(testId, 'placeholder')}
                  className={cn('truncate text-muted', classes?.placeholder)}
                >
                  {props.placeholder ?? t('treeSelect.placeholder')}
                </span>
              ) : multiple ? (
                <>
                  {ids.slice(0, Math.max(0, props.maxTagCount ?? 3)).map((key) => (
                    <span
                      key={key}
                      data-testid={partTestId(testId, 'tag', key)}
                      className={cn(
                        'inline-flex min-w-0 items-center gap-1 rounded bg-selected px-1.5 py-0.5 text-ui-sm text-ink',
                        classes?.tag,
                      )}
                    >
                      <span className="truncate">{display(key)}</span>
                      <button
                        type="button"
                        disabled={disabled}
                        aria-label={t('treeSelect.remove', { label: display(key) })}
                        data-testid={partTestId(testId, 'tagRemove', key)}
                        className={cn(
                          'rounded hover:bg-hover',
                          focusRingClassName,
                          classes?.tagRemove,
                        )}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          remove(key);
                        }}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        {glyph('close')}
                      </button>
                    </span>
                  ))}
                  {ids.length > (props.maxTagCount ?? 3) && (
                    <span>
                      {t('treeSelect.moreTags', {
                        count: ids.length - Math.max(0, props.maxTagCount ?? 3),
                      })}
                    </span>
                  )}
                </>
              ) : (
                <span
                  className="min-w-0 truncate"
                  dir={props.showPath ? 'rtl' : undefined}
                >
                  <bdi>{display(ids[0]!)}</bdi>
                </span>
              )}
            </span>
            {props.clearable && ids.length > 0 && (
              <button
                type="button"
                disabled={disabled}
                aria-label={t('treeSelect.clear')}
                data-testid={partTestId(testId, 'clear')}
                className={cn(
                  'rounded p-0.5 text-muted hover:bg-hover',
                  focusRingClassName,
                )}
                onPointerDown={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  clear();
                }}
              >
                {glyph('close')}
              </button>
            )}
            {glyph('chevronDown')}
          </div>
        </PopoverTrigger>
        <PopoverContent
          data-testid={partTestId(testId, 'popover')}
          align="start"
          className={cn(
            'w-[var(--radix-popover-trigger-width)] min-w-64 p-1',
            classes?.popover,
          )}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (searchable ? searchRef.current : treeRef.current)?.focus();
          }}
          onEscapeKeyDown={(event) => {
            if (query) {
              event.preventDefault();
              search('');
            }
          }}
        >
          {searchable && (
            <input
              ref={searchRef}
              role="combobox"
              aria-autocomplete="list"
              aria-haspopup="tree"
              aria-expanded={open}
              aria-controls={treeId}
              aria-activedescendant={activeDescendant}
              aria-label={t('treeSelect.search')}
              placeholder={t('treeSelect.search')}
              value={query}
              onChange={(event) => search(event.target.value)}
              onCompositionStart={() => {
                composing.current = true;
                notifySearch.cancel();
              }}
              onCompositionEnd={(event) => {
                composing.current = false;
                search(event.currentTarget.value);
              }}
              onKeyDown={keyboard}
              data-testid={partTestId(testId, 'search')}
              className={cn(
                controlBase,
                'mb-1 h-control-sm px-2',
                focusRingClassName,
                classes?.search,
              )}
            />
          )}
          <div
            ref={scrollRef}
            className="max-h-72 overflow-y-auto overscroll-contain"
            style={{ height: Math.min(280, rows.length * 40) }}
          >
            <div
              id={treeId}
              ref={treeRef}
              role="tree"
              aria-label={
                props['aria-label'] ??
                (typeof label === 'string' ? label : t('treeSelect.label'))
              }
              aria-multiselectable={multiple || undefined}
              aria-busy={busy || loadingLevel(null)}
              aria-activedescendant={!searchable ? activeDescendant : undefined}
              tabIndex={searchable ? -1 : 0}
              onKeyDown={searchable ? undefined : keyboard}
              data-testid={partTestId(testId, 'tree')}
              className={cn('relative outline-none', focusRingClassName, classes?.tree)}
              style={{ height: virtualizer.getTotalSize() }}
            >
              {items.map((item) => {
                const row = rows[item.index]!;
                const style = {
                  position: 'absolute' as const,
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${item.start}px)`,
                  paddingLeft: `${(('entry' in row ? row.entry.level : row.level) - 1) * 20 + 4}px`,
                };
                if (!('entry' in row)) {
                  const rowBusy =
                    loadingLevel(row.parent) ||
                    (row.parent != null && loading.has(row.parent));

                  return (
                    <div
                      key={row.key}
                      id={rowId(row.key)}
                      role="treeitem"
                      aria-level={row.level}
                      aria-disabled={rowBusy || undefined}
                      aria-label={t(
                        row.action === 'retry'
                          ? 'treeSelect.retry'
                          : 'treeSelect.loadMore',
                      )}
                      data-active={row.key === activeKey || undefined}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseMove={() => {
                        if (!rowDisabled(row)) setActive(row.key);
                      }}
                      data-index={item.index}
                      ref={virtualizer.measureElement}
                      style={style}
                    >
                      <button
                        type="button"
                        tabIndex={-1}
                        disabled={
                          rowBusy ||
                          busy ||
                          (row.parent !== null && model.get(row.parent)?.disabled)
                        }
                        data-testid={partTestId(
                          testId,
                          row.action === 'retry' ? 'retry' : 'loadMore',
                          row.parent ?? 'root',
                        )}
                        onClick={() => {
                          if (row.action === 'retry')
                            void load(model.get(row.parent!)!);
                          else props.onLoadMore?.(row.parent);
                        }}
                        className={cn(
                          'flex min-h-10 w-full items-center gap-2 rounded px-2 text-ui-sm text-accent hover:bg-hover',
                          focusRingClassName,
                          row.key === activeKey && 'bg-hover',
                          classes?.loadMore,
                        )}
                      >
                        {rowBusy ? (
                          <Spinner />
                        ) : row.action === 'retry' ? (
                          t('treeSelect.retry')
                        ) : (
                          t('treeSelect.loadMore')
                        )}
                      </button>
                    </div>
                  );
                }
                const { entry } = row;
                const { node } = entry;
                const selected = ids.includes(node.id);
                const checked = cascade
                  ? state.mixed.has(node.id)
                    ? 'mixed'
                    : state.checked.has(node.id)
                  : selected;
                const isExpanded = filtering || expanded.has(node.id);
                const range = filtering ? matchRange(node.label, query) : undefined;
                const nodeBusy = loading.has(node.id) || loadingLevel(node.id);

                return (
                  <div
                    key={row.key}
                    id={rowId(row.key)}
                    role="treeitem"
                    aria-level={entry.level}
                    aria-setsize={entry.siblings}
                    aria-posinset={entry.position}
                    aria-disabled={entry.disabled || undefined}
                    aria-expanded={isBranch(node) ? isExpanded : undefined}
                    aria-selected={!multiple ? selected : undefined}
                    aria-checked={multiple ? checked : undefined}
                    aria-busy={nodeBusy || undefined}
                    data-testid={partTestId(testId, 'row', node.id)}
                    data-active={row.key === activeKey || undefined}
                    data-index={item.index}
                    ref={virtualizer.measureElement}
                    style={style}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseMove={() => {
                      if (!entry.disabled) setActive(row.key);
                    }}
                    onClick={() => {
                      setActive(row.key);
                      if (entry.selectable) pick(node.id);
                      else if (!entry.disabled && isBranch(node)) expand(entry);
                    }}
                    className={cn(
                      'flex min-h-10 cursor-pointer items-center gap-2 rounded pr-2 text-control text-ink',
                      row.key === activeKey && 'bg-hover',
                      (multiple ? checked === true : selected) && 'bg-selected',
                      entry.disabled && 'cursor-not-allowed opacity-40',
                      classes?.row,
                      (multiple ? checked === true : selected) && classes?.rowSelected,
                    )}
                  >
                    {isBranch(node) ? (
                      <button
                        type="button"
                        tabIndex={-1}
                        disabled={entry.disabled}
                        aria-label={t(isExpanded ? 'tree.collapse' : 'tree.expand', {
                          label: node.label,
                        })}
                        data-testid={partTestId(testId, 'toggle', node.id)}
                        onClick={(event) => {
                          event.stopPropagation();
                          setActive(row.key);
                          expand(entry);
                        }}
                        className={cn(
                          'inline-flex size-6 shrink-0 items-center justify-center rounded hover:bg-hover-strong',
                          focusRingClassName,
                          classes?.toggle,
                        )}
                      >
                        {nodeBusy ? (
                          <Spinner size={14} />
                        ) : (
                          glyph(isExpanded ? 'chevronDown' : 'chevronRight')
                        )}
                      </button>
                    ) : (
                      <span className="w-6 shrink-0" />
                    )}
                    {multiple && (
                      <span
                        aria-hidden="true"
                        data-testid={partTestId(testId, 'checkbox', node.id)}
                        className={cn(
                          'flex size-4 shrink-0 items-center justify-center rounded border border-control-border text-ui-sm',
                          checked && 'bg-accent text-on-brand',
                          classes?.checkbox,
                        )}
                      >
                        {checked === 'mixed'
                          ? glyph('minus')
                          : checked
                            ? glyph('check')
                            : null}
                      </span>
                    )}
                    {props.renderNode ? (
                      props.renderNode(node, {
                        selected,
                        checked,
                        expanded: isExpanded,
                        disabled: entry.disabled,
                        level: entry.level,
                      })
                    ) : (
                      <>
                        {node.icon}
                        <span
                          data-testid={partTestId(testId, 'rowLabel', node.id)}
                          className={cn('min-w-0 flex-1', classes?.rowLabel)}
                        >
                          {range ? (
                            <>
                              {node.label.slice(0, range[0])}
                              <mark
                                data-testid={partTestId(testId, 'highlight', node.id)}
                                className={cn(
                                  'rounded-sm bg-selected font-semibold text-selected-ink',
                                  classes?.highlight,
                                )}
                              >
                                {node.label.slice(...range)}
                              </mark>
                              {node.label.slice(range[1])}
                            </>
                          ) : (
                            node.label
                          )}
                          {node.description && (
                            <span className="block text-ui-sm text-muted">
                              {node.description}
                            </span>
                          )}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {busy || loadingLevel(null) ? (
            <div
              role="status"
              className={cn('p-3 text-ui-sm text-muted', classes?.empty)}
            >
              <Spinner />
            </div>
          ) : (
            !rows.length && (
              <p
                role="status"
                data-testid={partTestId(testId, 'empty')}
                className={cn('p-3 text-ui-sm text-muted', classes?.empty)}
              >
                {t('treeSelect.empty')}
              </p>
            )
          )}
        </PopoverContent>
      </Popover>
      {name &&
        (ids.length ? ids : ['']).map((key, index) => (
          <input
            key={index}
            type="hidden"
            name={name}
            value={key}
            disabled={disabled}
          />
        ))}
      {error ? (
        <p
          id={`${id}-error`}
          data-testid={partTestId(testId, 'error')}
          className={cn('text-ui-sm text-danger-700', classes?.error)}
        >
          {error}
        </p>
      ) : (
        hint && (
          <p
            id={`${id}-hint`}
            data-testid={partTestId(testId, 'hint')}
            className={cn('text-ui-sm text-muted', classes?.hint)}
          >
            {hint}
          </p>
        )
      )}
    </div>
  );
}

TreeSelect[valueControl] = true;
