'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { defaultRangeExtractor, useVirtualizer } from '@tanstack/react-virtual';
import {
  cn,
  fieldDescription,
  partTestId,
  type SlotClasses,
} from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import { valueControl } from '../../components/common/form-control';
import { Checkbox } from '../../components/checkbox';
import { KitInput as Input } from '../../components/input/kit-input';
import { Button } from '../../components/button';
import { KitIcon } from '../../components/icon/kit-icon';
import { ArrowRightIcon } from '../../components/icon/outline/arrow-right';
import { ArrowRightIcon as ArrowRightBoldIcon } from '../../components/icon/bold/arrow-right';
import { CloseIcon } from '../../components/icon/outline/close';
import { CloseIcon as CloseBoldIcon } from '../../components/icon/bold/close';
import { useUILocale } from '../../i18n/provider';

export interface TransferItem {
  id: string;
  label: string;
  description?: ReactNode;
  disabled?: boolean;
}
export type TransferSide = 'source' | 'target';
export type TransferClassNames = SlotClasses<
  | 'root'
  | 'panel'
  | 'header'
  | 'search'
  | 'list'
  | 'item'
  | 'itemChecked'
  | 'actions'
  | 'button'
  | 'empty'
  | 'hint'
  | 'error'
>;
export interface TransferProps extends Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'children'
> {
  items: readonly TransferItem[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (ids: string[]) => void;
  order?: 'source' | 'selection';
  titles?: readonly [ReactNode, ReactNode];
  searchable?: boolean | readonly [boolean, boolean];
  filterItem?: (item: TransferItem, query: string) => boolean;
  showMoveAll?: boolean;
  oneWay?: boolean;
  maxSelected?: number;
  disabled?: boolean;
  height?: number;
  emptyContent?: ReactNode;
  renderItem?: (
    item: TransferItem,
    state: { side: TransferSide; checked: boolean },
  ) => ReactNode;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  name?: string;
  classNames?: TransferClassNames;
  'data-testid'?: string | undefined;
}

const normalize = (value: string) =>
  value.normalize('NFD').replace(/\p{M}/gu, '').replace(/[đĐ]/g, 'd').toLowerCase();

export function Transfer({
  items,
  value,
  defaultValue = [],
  onValueChange,
  order = 'source',
  titles,
  searchable,
  filterItem,
  showMoveAll,
  oneWay,
  maxSelected,
  disabled,
  height = 280,
  emptyContent,
  renderItem,
  label,
  hint,
  error,
  required,
  name,
  className,
  classNames,
  onBlur,
  id: suppliedId,
  'data-testid': testId,
  ...props
}: TransferProps) {
  const { t } = useUILocale();
  const generated = useId();
  const id = suppliedId ?? generated;
  const [local, setLocal] = useState<readonly string[]>(defaultValue);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [announcement, setAnnouncement] = useState({ text: '', sequence: 0 });
  const known = new Map(items.map((item) => [item.id, item]));
  const selected = new Set((value ?? local).filter((key) => known.has(key)));
  const ids =
    order === 'source'
      ? items.filter((item) => selected.has(item.id)).map((item) => item.id)
      : [...selected];
  const source = items.filter((item) => !selected.has(item.id));
  const target = ids.map((key) => known.get(key)!);
  const capacity = Math.max(0, (maxSelected ?? Infinity) - ids.length);
  const description =
    [
      fieldDescription(id, Boolean(error), Boolean(hint), props['aria-describedby']),
      maxSelected !== undefined ? `${id}-limit` : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  function move(side: TransferSide, candidates: readonly TransferItem[]) {
    if (disabled) return;
    const moving = candidates.filter(
      (item) =>
        !item.disabled &&
        (side === 'source' ? !selected.has(item.id) : selected.has(item.id)),
    );
    if (!moving.length || (side === 'source' && moving.length > capacity)) return;
    const moved = new Set(moving.map((item) => item.id));
    const nextSet = new Set(
      side === 'source' ? [...ids, ...moved] : ids.filter((key) => !moved.has(key)),
    );
    const next =
      order === 'source'
        ? items.filter((item) => nextSet.has(item.id)).map((item) => item.id)
        : [...nextSet];
    setLocal(next);
    onValueChange?.(next);

    setChecked((previous) => new Set([...previous].filter((key) => !moved.has(key))));

    setAnnouncement((previous) => ({
      sequence: previous.sequence + 1,
      text: t(side === 'source' ? 'transfer.movedRight' : 'transfer.movedLeft', {
        count: moving.length,
      }),
    }));
  }

  const pick = (keys: string[], mode: 'toggle' | 'add' | 'remove') =>
    setChecked((previous) => {
      const next = new Set(previous);
      for (const key of keys) {
        if (mode === 'remove' || (mode === 'toggle' && next.has(key))) next.delete(key);
        else next.add(key);
      }

      return next;
    });

  const action = (side: TransferSide, all: boolean) => {
    const sideItems = side === 'source' ? source : target;
    const candidates = (
      all
        ? sideItems
        : [...checked].flatMap((key) => {
            const item = known.get(key);

            return item && (side === 'source' ? !selected.has(key) : selected.has(key))
              ? [item]
              : [];
          })
    ).filter((item) => !item.disabled);

    return (
      <Button
        variant="secondary"
        size="sm"
        className={cn('motion-reduce:transition-none', classNames?.button)}
        data-testid={partTestId(testId, all ? `${side}-moveAll` : `${side}-move`)}
        aria-label={t(
          side === 'source'
            ? all
              ? 'transfer.moveAllRight'
              : 'transfer.moveRight'
            : all
              ? 'transfer.moveAllLeft'
              : 'transfer.moveLeft',
        )}
        disabled={
          disabled ||
          !candidates.length ||
          (side === 'source' && candidates.length > capacity)
        }
        onClick={() => move(side, candidates)}
      >
        <span
          className={cn(
            'flex rotate-90 sm:rotate-0',
            side === 'target' && 'rotate-[270deg] sm:rotate-180',
          )}
        >
          <KitIcon
            name="arrowRight"
            builtin={{ outline: ArrowRightIcon, bold: ArrowRightBoldIcon }}
            size={16}
          />
          {all && (
            <KitIcon
              name="arrowRight"
              builtin={{ outline: ArrowRightIcon, bold: ArrowRightBoldIcon }}
              size={16}
            />
          )}
        </span>
      </Button>
    );
  };

  return (
    <div
      {...props}
      id={id}
      tabIndex={-1}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onBlur?.(event);
      }}
      role="group"
      aria-label={
        props['aria-label'] ?? (label == null ? t('transfer.label') : undefined)
      }
      aria-labelledby={
        props['aria-labelledby'] ?? (label != null ? `${id}-label` : undefined)
      }
      aria-disabled={disabled}
      aria-invalid={Boolean(error) || props['aria-invalid']}
      aria-describedby={description}
      data-testid={testId}
      className={cn('grid min-w-0 content-start gap-2', classNames?.root, className)}
    >
      {label != null && (
        <span id={`${id}-label`} className="text-ui-sm font-medium text-ink">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-danger-700">
              *
            </span>
          )}
        </span>
      )}
      <div className="grid min-w-0 grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        {(['source', 'target'] as const).map((side, index) => (
          <TransferPanel
            key={side}
            {...{
              side,
              checked,
              pick,
              move,
              disabled,
              height,
              emptyContent,
              renderItem,
              classNames,
              filterItem,
            }}
            id={`${id}-${side}`}
            testId={partTestId(testId, side)}
            items={side === 'source' ? source : target}
            title={
              titles?.[index] ??
              t(side === 'source' ? 'transfer.available' : 'transfer.selected')
            }
            searchable={
              typeof searchable === 'boolean' ? searchable : searchable?.[index]
            }
            removable={Boolean(oneWay && side === 'target')}
            required={required}
            error={Boolean(error)}
            description={description}
            actions={
              index === 0 ? (
                <div
                  data-testid={partTestId(testId, 'actions')}
                  className={cn(
                    'flex justify-center gap-2 sm:flex-col',
                    classNames?.actions,
                  )}
                >
                  {action('source', false)}
                  {!oneWay && action('target', false)}
                  {showMoveAll && action('source', true)}
                  {showMoveAll && !oneWay && action('target', true)}
                </div>
              ) : undefined
            }
          />
        ))}
      </div>
      {name &&
        ids.map((key) => (
          <input key={key} type="hidden" name={name} value={key} disabled={disabled} />
        ))}
      {maxSelected !== undefined && (
        <p
          className={cn('text-ui-sm text-muted', classNames?.hint)}
          id={`${id}-limit`}
          data-testid={partTestId(testId, 'limit')}
        >
          {t('transfer.limit', { count: maxSelected })}
        </p>
      )}
      {hint && !error && (
        <p
          id={`${id}-hint`}
          data-testid={partTestId(testId, 'hint')}
          className={cn('text-ui-sm text-muted', classNames?.hint)}
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          role="alert"
          id={`${id}-error`}
          data-testid={partTestId(testId, 'error')}
          className={cn('text-ui-sm text-danger-700', classNames?.error)}
        >
          {error}
        </p>
      )}
      <span aria-live="polite" aria-atomic="true" className="sr-only">
        <span key={announcement.sequence}>{announcement.text}</span>
      </span>
    </div>
  );
}

Transfer[valueControl] = true;

type PanelOptions = Pick<
  TransferProps,
  | 'disabled'
  | 'height'
  | 'emptyContent'
  | 'renderItem'
  | 'classNames'
  | 'filterItem'
  | 'required'
>;
type PanelProps = { [Key in keyof PanelOptions]: PanelOptions[Key] | undefined } & {
  side: TransferSide;
  items: readonly TransferItem[];
  title: ReactNode;
  id: string;
  testId?: string | undefined;
  searchable?: boolean | undefined;
  removable: boolean;
  checked: Set<string>;
  pick: (keys: string[], mode: 'toggle' | 'add' | 'remove') => void;
  move: (side: TransferSide, items: readonly TransferItem[]) => void;
  actions?: ReactNode;
  error: boolean;
  description?: string | undefined;
};

function TransferPanel({
  side,
  items,
  title,
  id,
  testId,
  searchable,
  removable,
  checked,
  pick,
  move,
  disabled,
  height = 280,
  emptyContent,
  renderItem,
  classNames,
  filterItem,
  actions,
  required,
  error,
  description,
}: PanelProps) {
  const { t } = useUILocale();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string>();
  const anchor = useRef<string | undefined>(undefined);
  const scroll = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef(false);
  const hadRowFocus = useRef(false);

  const panelMove = (item: TransferItem) => {
    hadRowFocus.current = Boolean(scroll.current?.contains(document.activeElement));
    move(side, [item]);
  };

  const visible = items.filter(
    (item) =>
      !query ||
      (filterItem
        ? filterItem(item, query)
        : normalize(item.label).includes(normalize(query))),
  );
  const enabled = visible.filter((item) => !item.disabled);
  const current = enabled.some((item) => item.id === active) ? active : enabled[0]?.id;
  const activeIndex = visible.findIndex((item) => item.id === current);
  const virtual = visible.length > 100;
  const virtualizer = useVirtualizer({
    count: visible.length,
    enabled: virtual,
    getScrollElement: () => scroll.current,
    estimateSize: () => 56,
    getItemKey: (index) => visible[index]!.id,
    overscan: 5,
    initialRect: { width: 300, height },
    rangeExtractor: (range) =>
      [
        ...new Set([
          ...defaultRangeExtractor(range),
          ...(activeIndex >= 0 ? [activeIndex] : []),
        ]),
      ].sort((a, b) => a - b),
  });

  useEffect(() => {
    if (hadRowFocus.current) {
      hadRowFocus.current = false;
      const focused = document.activeElement;
      if (focused === document.body || scroll.current?.contains(focused)) {
        const option = Array.from(
          scroll.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [],
        ).find((element) => element.tabIndex === 0);
        (option ?? scroll.current)?.focus();
      }
    }
  }, [items]);

  const selectedCount = enabled.filter((item) => checked.has(item.id)).length;
  const allChecked = enabled.length > 0 && selectedCount === enabled.length;

  const row = (item: TransferItem, index: number, start?: number) => (
    <div
      key={item.id}
      data-index={index}
      ref={virtual ? virtualizer.measureElement : undefined}
      style={
        virtual
          ? {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${start}px)`,
            }
          : undefined
      }
      className="flex items-center gap-1"
    >
      <div
        role="option"
        id={`${id}-item-${encodeURIComponent(item.id)}`}
        aria-label={item.label}
        aria-selected={checked.has(item.id)}
        aria-disabled={disabled || item.disabled}
        aria-posinset={index + 1}
        aria-setsize={visible.length}
        tabIndex={!disabled && !item.disabled && current === item.id ? 0 : -1}
        ref={(element) => {
          if (element && current === item.id && pendingFocus.current) {
            pendingFocus.current = false;
            element.focus({ preventScroll: virtual });
          }
        }}
        data-testid={partTestId(testId, 'item', item.id)}
        className={cn(
          'flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-control p-3 text-control text-ink hover:bg-hover aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
          focusRingClassName,
          checked.has(item.id) && 'bg-selected',
          classNames?.item,
          checked.has(item.id) && classNames?.itemChecked,
        )}
        onFocus={() => setActive(item.id)}
        onClick={() => {
          if (!disabled && !item.disabled) {
            setActive(item.id);
            anchor.current = item.id;
            pick([item.id], 'toggle');
          }
        }}
        onKeyDown={(event) => {
          if (disabled || item.disabled || event.nativeEvent.isComposing) return;
          if (event.target !== event.currentTarget) return;
          const position = enabled.findIndex((entry) => entry.id === item.id);
          let next: TransferItem | undefined;
          if (event.key === 'ArrowDown')
            next = enabled[Math.min(position + 1, enabled.length - 1)];
          if (event.key === 'ArrowUp') next = enabled[Math.max(0, position - 1)];
          if (event.key === 'Home') next = enabled[0];
          if (event.key === 'End') next = enabled.at(-1);
          if (next) {
            event.preventDefault();
            if (event.shiftKey) {
              anchor.current ??= item.id;
              const from = Math.max(
                0,
                enabled.findIndex((entry) => entry.id === (anchor.current ?? item.id)),
              );
              pick(
                enabled
                  .slice(
                    Math.min(from, enabled.indexOf(next)),
                    Math.max(from, enabled.indexOf(next)) + 1,
                  )
                  .map((entry) => entry.id),
                'add',
              );
            } else anchor.current = next.id;
            pendingFocus.current = true;
            setActive(next.id);
            if (virtual)
              virtualizer.scrollToIndex(visible.indexOf(next), { align: 'auto' });
          } else if (event.key === ' ') {
            event.preventDefault();
            anchor.current = item.id;
            pick([item.id], 'toggle');
          } else if (event.key === 'Enter') {
            event.preventDefault();
            panelMove(item);
          } else if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === 'a'
          ) {
            event.preventDefault();
            pick(
              enabled.map((entry) => entry.id),
              'add',
            );
          }
        }}
      >
        <span aria-hidden="true" className="pointer-events-none">
          <Checkbox
            tabIndex={-1}
            checked={checked.has(item.id)}
            disabled={disabled || item.disabled}
          />
        </span>
        <div className="min-w-0 flex-1">
          {renderItem ? (
            renderItem(item, { side, checked: checked.has(item.id) })
          ) : (
            <>
              <div>{item.label}</div>
              {item.description != null && (
                <div className="text-ui-sm text-muted">{item.description}</div>
              )}
            </>
          )}
        </div>
      </div>
      {removable && (
        <Button
          variant="ghost"
          size="sm"
          aria-label={t('transfer.remove', { label: item.label })}
          disabled={disabled || item.disabled}
          className={cn('motion-reduce:transition-none', classNames?.button)}
          data-testid={partTestId(testId, 'remove', item.id)}
          onClick={() => panelMove(item)}
        >
          <KitIcon
            name="close"
            builtin={{ outline: CloseIcon, bold: CloseBoldIcon }}
            size={16}
          />
        </Button>
      )}
    </div>
  );

  return (
    <>
      <section
        role="group"
        aria-labelledby={`${id}-title`}
        data-testid={testId}
        className={cn(
          'min-w-0 overflow-hidden rounded-panel border border-line bg-surface',
          error && 'border-danger-700',
          classNames?.panel,
        )}
      >
        <div
          data-testid={partTestId(testId, 'header')}
          className={cn(
            'flex items-center gap-2 border-b border-line p-3',
            classNames?.header,
          )}
        >
          <Checkbox
            aria-label={t('transfer.selectAll')}
            checked={allChecked ? true : selectedCount ? 'indeterminate' : false}
            disabled={disabled || !enabled.length}
            onCheckedChange={() =>
              pick(
                enabled.map((item) => item.id),
                allChecked ? 'remove' : 'add',
              )
            }
            data-testid={partTestId(testId, 'selectAll')}
          />
          <span id={`${id}-title`} className="flex-1 font-medium text-ink">
            {title}
          </span>
          <span className="text-ui-sm text-muted">
            {t('transfer.count', { count: selectedCount, total: visible.length })}
          </span>
        </div>
        {searchable && (
          <Input
            type="search"
            aria-label={t(
              side === 'source' ? 'transfer.searchSource' : 'transfer.searchTarget',
            )}
            placeholder={t('transfer.search')}
            value={query}
            disabled={disabled}
            onChange={(event) => {
              setQuery(event.target.value);
              if (virtual) virtualizer.scrollToOffset(0);
              setActive(undefined);
              anchor.current = undefined;
            }}
            data-testid={partTestId(testId, 'search')}
            className={classNames?.search}
            classNames={{ root: 'p-2' }}
          />
        )}
        <div
          ref={scroll}
          role="listbox"
          aria-labelledby={`${id}-title`}
          aria-multiselectable="true"
          aria-disabled={disabled}
          aria-required={required}
          aria-invalid={error}
          aria-describedby={description}
          tabIndex={!enabled.length && !disabled ? 0 : -1}
          data-testid={partTestId(testId, 'list')}
          className={cn('overflow-auto p-1', focusRingClassName, classNames?.list)}
          style={{ height }}
        >
          {!visible.length ? (
            <div
              data-testid={partTestId(testId, 'empty')}
              className={cn('p-6 text-center text-ui-sm text-muted', classNames?.empty)}
            >
              {emptyContent ?? t('transfer.empty')}
            </div>
          ) : virtual ? (
            <div
              role="presentation"
              style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
            >
              {virtualizer
                .getVirtualItems()
                .map((entry) => row(visible[entry.index]!, entry.index, entry.start))}
            </div>
          ) : (
            visible.map((item, index) => row(item, index))
          )}
        </div>
      </section>
      {actions}
    </>
  );
}
