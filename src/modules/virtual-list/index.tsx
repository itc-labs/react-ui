'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import {
  defaultRangeExtractor,
  useVirtualizer,
  useWindowVirtualizer,
} from '@tanstack/react-virtual';
import { cn, partTestId, type SlotClasses } from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import { Button } from '../../components/button';
import { Skeleton } from '../../components/skeleton';
import { Spinner } from '../../components/spinner';
import { useUILocale } from '../../i18n/provider';

export type VirtualListClassNames = SlotClasses<
  | 'root'
  | 'viewport'
  | 'list'
  | 'item'
  | 'row'
  | 'loader'
  | 'loadMore'
  | 'retry'
  | 'empty'
  | 'skeleton'
>;
export interface VirtualListProps<T> extends Omit<ComponentProps<'div'>, 'children'> {
  items: readonly T[];
  getItemKey: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
  /** Estimated row height in pixels; mounted rows are measured dynamically. */
  estimateSize?: number;
  overscan?: number;
  scroll?: 'container' | 'window';
  height?: number | string;
  maxHeight?: number | string;
  hasMore?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
  loadMore?: 'auto' | 'button';
  loadMoreThreshold?: number;
  error?: ReactNode;
  onRetry?: () => void;
  skeletonCount?: number;
  renderSkeleton?: (index: number) => ReactNode;
  emptyContent?: ReactNode;
  /** Stores the scroll offset under this key in sessionStorage. */
  restoreKey?: string;
  itemRole?: React.AriaRole;
  classNames?: VirtualListClassNames;
  'data-testid'?: string;
}
export type VirtualGridClassNames = VirtualListClassNames;
export type VirtualGridColumns =
  number | { base?: number; sm?: number; md?: number; lg?: number; xl?: number };
export interface VirtualGridProps<T> extends VirtualListProps<T> {
  /** Responsive values follow viewport breakpoints: 640, 768, 1024, 1280px. */
  columns?: VirtualGridColumns;
  /** Computes auto-fill columns from the measured container width; takes precedence over columns. */
  minItemWidth?: number;
  gap?: number;
  aspectRatio?: number;
}

export function VirtualList<T>(props: VirtualListProps<T>) {
  return <VirtualCollection {...props} />;
}

export function VirtualGrid<T>(props: VirtualGridProps<T>) {
  return <VirtualCollection {...props} grid />;
}

function VirtualCollection<T>({
  items,
  getItemKey,
  renderItem,
  estimateSize,
  overscan = 5,
  scroll = 'container',
  height,
  maxHeight,
  hasMore,
  loading,
  onLoadMore,
  loadMore = 'auto',
  loadMoreThreshold = 5,
  error,
  onRetry,
  skeletonCount = 6,
  renderSkeleton,
  emptyContent,
  restoreKey,
  itemRole = 'listitem',
  className,
  classNames,
  role = 'list',
  ref,
  style,
  onKeyDown,
  onFocusCapture,
  onBlurCapture,
  'data-testid': testId,
  columns = 1,
  minItemWidth,
  gap = 16,
  aspectRatio,
  grid = false,
  ...props
}: VirtualGridProps<T> & { grid?: boolean }) {
  const { t } = useUILocale();
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [list, setList] = useState<HTMLDivElement | null>(null);
  const [geometry, setGeometry] = useState({ width: 0, viewport: 0, margin: 0 });
  const [focusedKey, setFocusedKey] = useState<string>();
  const pendingFocus = useRef<string | undefined>(undefined);
  const requestedLength = useRef<number | undefined>(undefined);
  const previousLength = useRef(items.length);
  const [announcement, setAnnouncement] = useState('');
  const isWindow = scroll === 'window';
  const hasError = error != null && error !== false;
  const attach = useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node);
      if (typeof ref === 'function') return ref(node);
      if (ref) ref.current = node;
    },
    [ref],
  );

  useLayoutEffect(() => {
    if (!element || !list) return;

    const update = () =>
      setGeometry({
        width: list.getBoundingClientRect().width,
        viewport: window.innerWidth,
        margin: list.getBoundingClientRect().top + window.scrollY,
      });

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    observer.observe(list);
    observer.observe(document.documentElement);
    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [element, list]);

  let columnCount = 1;
  if (grid) {
    if (minItemWidth && minItemWidth > 0)
      columnCount = Math.max(
        1,
        Math.floor((geometry.width + gap) / (minItemWidth + gap)),
      );
    else if (typeof columns === 'number') columnCount = columns;
    else {
      columnCount = columns.base ?? 1;
      for (const [key, width] of [
        ['sm', 640],
        ['md', 768],
        ['lg', 1024],
        ['xl', 1280],
      ] as const) {
        if (geometry.viewport >= width) columnCount = columns[key] ?? columnCount;
      }
    }
  }
  columnCount = Math.max(1, Math.floor(columnCount) || 1);
  const rowSize =
    estimateSize ??
    (grid && aspectRatio && aspectRatio > 0
      ? Math.max(
          1,
          (geometry.width - gap * (columnCount - 1)) / columnCount / aspectRatio,
        )
      : 56);
  const focusedIndex = items.findIndex((item) => getItemKey(item) === focusedKey);
  const options = {
    count: Math.ceil(items.length / columnCount),
    estimateSize: () => rowSize,
    getItemKey: (index: number) => getItemKey(items[index * columnCount]!),
    overscan,
    gap: grid ? gap : 0,
    rangeExtractor: (range: Parameters<typeof defaultRangeExtractor>[0]) =>
      [
        ...new Set([
          ...defaultRangeExtractor(range),
          ...(focusedIndex >= 0 ? [Math.floor(focusedIndex / columnCount)] : []),
        ]),
      ].sort((a, b) => a - b),
  };
  const containerVirtualizer = useVirtualizer({
    ...options,
    enabled: !isWindow,
    getScrollElement: () => element,
  });
  const windowVirtualizer = useWindowVirtualizer({
    ...options,
    enabled: isWindow,
    scrollMargin: geometry.margin,
  });
  const virtualizer = isWindow ? windowVirtualizer : containerVirtualizer;
  const rows = virtualizer.getVirtualItems();
  const lastIndex = rows.length
    ? Math.min(items.length - 1, (rows[rows.length - 1]!.index + 1) * columnCount - 1)
    : -1;

  useEffect(() => {
    if (
      loadMore === 'auto' &&
      hasMore &&
      !loading &&
      !hasError &&
      onLoadMore &&
      lastIndex >= items.length - 1 - loadMoreThreshold &&
      requestedLength.current !== items.length
    ) {
      requestedLength.current = items.length;
      onLoadMore();
    }
  }, [
    lastIndex,
    items.length,
    hasMore,
    loading,
    error,
    onLoadMore,
    loadMore,
    loadMoreThreshold,
  ]);

  useEffect(() => {
    if (items.length > previousLength.current)
      setAnnouncement(
        t('virtualList.loaded', { count: items.length - previousLength.current }),
      );
    previousLength.current = items.length;
  }, [items.length, t]);

  useLayoutEffect(() => {
    if (!restoreKey || !element) return;
    const target = isWindow ? window : element;
    try {
      const stored = sessionStorage.getItem(restoreKey);
      const offset = stored === null ? NaN : Number(stored);
      if (Number.isFinite(offset) && offset >= 0)
        target.scrollTo({ top: offset, behavior: 'instant' });
    } catch {
      /* Storage may be unavailable. */
    }

    const save = () => {
      try {
        sessionStorage.setItem(
          restoreKey,
          String(isWindow ? window.scrollY : element.scrollTop),
        );
      } catch {
        /* Storage may be unavailable. */
      }
    };

    target.addEventListener('scroll', save);

    return () => {
      target.removeEventListener('scroll', save);
    };
  }, [restoreKey, element, isWindow]);

  useLayoutEffect(() => {
    virtualizer.measure();
    list
      ?.querySelectorAll<HTMLElement>(':scope > [data-index]')
      .forEach(virtualizer.measureElement);
  }, [columnCount, rowSize, virtualizer, list]);

  return (
    <div
      {...props}
      ref={attach}
      role={role}
      aria-busy={Boolean(loading)}
      tabIndex={props.tabIndex ?? 0}
      data-testid={testId}
      className={cn(
        'relative min-w-0 text-ink',
        !isWindow && 'overflow-auto',
        focusRingClassName,
        classNames?.root,
        classNames?.viewport,
        className,
      )}
      style={{ ...(!isWindow ? { height, maxHeight } : {}), ...style }}
      onFocusCapture={(event) => {
        onFocusCapture?.(event);
        const item = (event.target as HTMLElement).closest<HTMLElement>(
          '[data-virtual-key]',
        );
        if (item) setFocusedKey(item.dataset.virtualKey);
      }}
      onBlurCapture={(event) => {
        onBlurCapture?.(event);
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocusedKey(undefined);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          event.defaultPrevented ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          (event.target !== event.currentTarget &&
            !(event.target as HTMLElement).hasAttribute('data-virtual-key'))
        )
          return;
        let next: number;
        if (event.key === 'ArrowDown')
          next = focusedIndex < 0 ? 0 : focusedIndex + columnCount;
        else if (event.key === 'ArrowUp')
          next = Math.max(0, focusedIndex - columnCount);
        else if (grid && event.key === 'ArrowRight') next = focusedIndex + 1;
        else if (grid && event.key === 'ArrowLeft')
          next = Math.max(0, focusedIndex - 1);
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = items.length - 1;
        else return;
        if (!items.length) return;
        event.preventDefault();
        next = Math.min(items.length - 1, next);
        const key = getItemKey(items[next]!);
        pendingFocus.current = key;
        setFocusedKey(key);
        virtualizer.scrollToIndex(Math.floor(next / columnCount), { align: 'auto' });
        const mounted = Array.from(
          element?.querySelectorAll<HTMLElement>('[data-virtual-key]') ?? [],
        ).find((node) => node.dataset.virtualKey === key);
        if (mounted) {
          pendingFocus.current = undefined;
          mounted.focus({ preventScroll: true });
        }
      }}
    >
      <div
        ref={setList}
        role="presentation"
        data-testid={partTestId(testId, 'list')}
        className={cn('relative w-full', classNames?.list)}
        style={{ height: virtualizer.getTotalSize() }}
      >
        {rows.map((row) => (
          <div
            key={row.key}
            ref={virtualizer.measureElement}
            data-index={row.index}
            role="presentation"
            data-testid={partTestId(testId, 'row', String(row.key))}
            className={cn('absolute left-0 top-0 w-full', classNames?.row)}
            style={{
              transform: `translateY(${row.start - (isWindow ? geometry.margin : 0)}px)`,
              ...(grid
                ? {
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                    gap,
                  }
                : {}),
            }}
          >
            {items
              .slice(row.index * columnCount, (row.index + 1) * columnCount)
              .map((item, localIndex) => {
                const key = getItemKey(item);
                const index = row.index * columnCount + localIndex;

                return (
                  <div
                    key={key}
                    role={itemRole}
                    aria-posinset={index + 1}
                    aria-setsize={items.length}
                    tabIndex={-1}
                    data-virtual-key={key}
                    ref={(node) => {
                      if (node && pendingFocus.current === key) {
                        pendingFocus.current = undefined;
                        node.focus({ preventScroll: true });
                      }
                    }}
                    data-testid={partTestId(testId, 'item', key)}
                    className={cn('min-w-0', focusRingClassName, classNames?.item)}
                    style={grid && aspectRatio ? { aspectRatio } : undefined}
                  >
                    {renderItem(item, index)}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
      {loading && !items.length && (
        <div
          role="presentation"
          className={cn('grid', classNames?.loader)}
          data-testid={partTestId(testId, 'loader')}
          style={
            grid
              ? { gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`, gap }
              : undefined
          }
        >
          {Array.from({ length: skeletonCount }, (_, index) => (
            <div
              key={index}
              className={classNames?.skeleton}
              data-testid={partTestId(testId, 'skeleton', index)}
            >
              {renderSkeleton ? (
                renderSkeleton(index)
              ) : (
                <Skeleton style={{ height: rowSize }} />
              )}
            </div>
          ))}
        </div>
      )}
      {!items.length && !loading && !hasError && (
        <div
          role="presentation"
          data-testid={partTestId(testId, 'empty')}
          className={cn('p-6 text-center text-ui-sm text-muted', classNames?.empty)}
        >
          {emptyContent ?? t('virtualList.empty')}
        </div>
      )}
      {hasError && (
        <div
          role="presentation"
          className={cn(
            'flex items-center justify-center gap-3 p-3',
            classNames?.retry,
          )}
          data-testid={partTestId(testId, 'retry')}
        >
          <span role="alert">{error}</span>
          {onRetry && (
            <Button variant="secondary" onClick={onRetry} disabled={loading}>
              {t('virtualList.retry')}
            </Button>
          )}
        </div>
      )}
      {loadMore === 'button' && hasMore && !hasError && (
        <div
          role="presentation"
          className={cn('flex justify-center p-3', classNames?.loader)}
        >
          <Button
            loading={Boolean(loading)}
            disabled={loading}
            onClick={onLoadMore}
            className={classNames?.loadMore}
            data-testid={partTestId(testId, 'loadMore')}
          >
            {t('virtualList.loadMore')}
          </Button>
        </div>
      )}
      {loading && items.length > 0 && loadMore !== 'button' && (
        <div
          role="presentation"
          className={cn('flex justify-center p-3', classNames?.loader)}
          data-testid={partTestId(testId, 'loader')}
        >
          <Spinner />
        </div>
      )}
      <span role="presentation" className="sr-only">
        <span aria-live="polite" aria-atomic="true">
          {announcement}
        </span>
      </span>
    </div>
  );
}
