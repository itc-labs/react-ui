'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type Key,
  type ReactNode,
} from 'react';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn, partTestId } from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import { KitIcon } from '../../components/icon/kit-icon';
import { ChevronLeftIcon } from '../../components/icon/outline/chevron-left';
import { ChevronLeftIcon as ChevronLeftBoldIcon } from '../../components/icon/bold/chevron-left';
import { ChevronRightIcon } from '../../components/icon/outline/chevron-right';
import { ChevronRightIcon as ChevronRightBoldIcon } from '../../components/icon/bold/chevron-right';
import { useUILocale } from '../../i18n/provider';

export type CarouselApi = NonNullable<UseEmblaCarouselType[1]>;
export type CarouselClassNames = Partial<
  Record<
    | 'root'
    | 'viewport'
    | 'container'
    | 'slide'
    | 'controls'
    | 'prev'
    | 'next'
    | 'dots'
    | 'dot'
    | 'autoplay',
    string
  >
>;
export type CarouselPerView =
  number | { base?: number; sm?: number; md?: number; lg?: number; xl?: number };
export interface CarouselAutoplayOptions {
  delay?: number;
  stopOnInteraction?: boolean;
  stopOnMouseEnter?: boolean;
  stopOnFocusIn?: boolean;
  /** Allow automatic rotation even when reduced motion is requested. */
  force?: boolean;
}
export interface CarouselProps<T> extends Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> {
  items: readonly T[];
  renderItem: (item: T, index: number) => ReactNode;
  getItemKey: (item: T, index: number) => Key;
  perView?: CarouselPerView;
  /** Items stacked in each slide column. Indices and dots address scroll snaps. */
  rows?: number;
  gap?: 0 | 1 | 2 | 3 | 4 | 6 | 8;
  arrows?: boolean;
  arrowPlacement?: 'outside' | 'overlay';
  dots?: boolean;
  loop?: boolean;
  align?: 'start' | 'center';
  dragFree?: boolean;
  autoplay?: boolean | CarouselAutoplayOptions;
  index?: number;
  defaultIndex?: number;
  onSlideChange?: (index: number) => void;
  setApi?: (api: CarouselApi | undefined) => void;
  classNames?: CarouselClassNames;
  'data-testid'?: string;
}

const positive = (value: number | undefined, fallback = 1) =>
  value !== undefined && Number.isFinite(value)
    ? Math.max(1, Math.floor(value))
    : fallback;

export function Carousel<T>({
  items,
  renderItem,
  getItemKey,
  perView = 1,
  rows = 1,
  gap = 4,
  arrows = true,
  arrowPlacement = 'outside',
  dots = false,
  loop = false,
  align = 'start',
  dragFree = false,
  autoplay = false,
  index,
  defaultIndex = 0,
  onSlideChange,
  setApi,
  className,
  classNames,
  style,
  'data-testid': testId,
  onKeyDown,
  onFocusCapture,
  ...props
}: CarouselProps<T>) {
  const { t } = useUILocale();
  // Start conservatively until the client preference has been read.
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const playback = useRef({ paused, enabled: false });
  const restoring = useRef(false);
  const callbacks = useRef({ index, onSlideChange });
  callbacks.current = { index, onSlideChange };
  const config = typeof autoplay === 'object' ? autoplay : undefined;
  const enabled = Boolean(autoplay) && (!reduced || Boolean(config?.force));
  playback.current = { paused, enabled };
  const plugin = useMemo(
    () =>
      Autoplay({
        delay: config?.delay ?? 4000,
        stopOnInteraction: config?.stopOnInteraction ?? true,
        stopOnMouseEnter: config?.stopOnMouseEnter ?? true,
        stopOnFocusIn: config?.stopOnFocusIn ?? true,
        playOnInit: false,
        rootNode: (viewport) => viewport.parentElement,
      }),
    [
      config?.delay,
      config?.stopOnInteraction,
      config?.stopOnMouseEnter,
      config?.stopOnFocusIn,
    ],
  );
  const plugins = useMemo(
    () => (autoplay ? [plugin] : []),
    [Boolean(autoplay), plugin],
  );
  const [viewportRef, api] = useEmblaCarousel(
    { loop, align, dragFree, startIndex: defaultIndex, duration: reduced ? 0 : 25 },
    plugins,
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => setReduced(query.matches);

    update();
    query.addEventListener('change', update);

    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setApi?.(api);

    return () => setApi?.(undefined);
  }, [api, setApi]);

  useEffect(() => {
    if (!api) return;

    const sync = () => {
      setSelected(api.selectedScrollSnap());
      setSnaps(api.scrollSnapList());
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
      setPlaying(plugin.isPlaying());
    };

    const select = () => {
      const next = api.selectedScrollSnap();
      sync();
      if (restoring.current) return;
      callbacks.current.onSlideChange?.(next);
      const controlled = callbacks.current.index;
      if (controlled !== undefined && controlled !== next) {
        restoring.current = true;
        api.scrollTo(controlled, true);
        restoring.current = false;
      }
    };

    const play = () => {
      setPlaying(true);

      queueMicrotask(() => {
        if (playback.current.paused || !playback.current.enabled) plugin.stop();
      });
    };

    const stop = () => setPlaying(false);

    const reInit = () => {
      sync();
      if (
        autoplay &&
        playback.current.enabled &&
        !playback.current.paused &&
        api.scrollSnapList().length > 1
      )
        plugin.play();
    };

    api
      .on('select', select)
      .on('reInit', reInit)
      .on('autoplay:play', play)
      .on('autoplay:stop', stop);
    sync();

    return () => {
      api
        .off('select', select)
        .off('reInit', reInit)
        .off('autoplay:play', play)
        .off('autoplay:stop', stop);
    };
  }, [api, plugin, Boolean(autoplay)]);

  useEffect(() => {
    if (index !== undefined) api?.scrollTo(index, reduced);
  }, [api, index, reduced]);

  useEffect(() => {
    if (!api || !autoplay) return;
    if (enabled && !paused && api.scrollSnapList().length > 1) plugin.play();
    else plugin.stop();
    setPlaying(plugin.isPlaying());
  }, [api, autoplay, enabled, paused, plugin, items.length, reduced, snaps.length]);

  const navigate = (action: () => void) => {
    if (autoplay) {
      if (config?.stopOnInteraction ?? true) {
        setPaused(true);
        plugin.stop();
      } else plugin.reset();
    }
    action();
  };

  const count = positive(rows);
  const columns = Array.from({ length: Math.ceil(items.length / count) }, (_, column) =>
    items.slice(column * count, (column + 1) * count),
  );

  const views = typeof perView === 'number' ? { base: perView } : perView;
  const base = positive(views.base),
    sm = positive(views.sm, base),
    md = positive(views.md, sm),
    lg = positive(views.lg, md),
    xl = positive(views.xl, lg);

  useEffect(() => {
    api?.reInit();
  }, [api, columns.length, base, sm, md, lg, xl, gap]);

  const buttonClass = cn(
    'inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-control-border bg-surface text-ink disabled:cursor-not-allowed disabled:opacity-40',
    focusRingClassName,
  );

  return (
    <div
      {...props}
      role={props.role ?? 'region'}
      aria-roledescription="carousel"
      aria-label={props['aria-label'] ?? t('carousel.label')}
      tabIndex={props.tabIndex ?? 0}
      data-testid={testId}
      className={cn(
        'relative min-w-0',
        focusRingClassName,
        classNames?.root,
        className,
      )}
      style={
        {
          '--carousel-base': base,
          '--carousel-sm': sm,
          '--carousel-md': md,
          '--carousel-lg': lg,
          '--carousel-xl': xl,
          '--carousel-gap': `calc(var(--spacing, 0.25rem) * ${gap})`,
          ...style,
        } as CSSProperties
      }
      onFocusCapture={(event) => {
        onFocusCapture?.(event);
        if (
          !event.defaultPrevented &&
          autoplay &&
          (config?.stopOnFocusIn ?? true) &&
          !(event.target as HTMLElement).closest('[data-carousel-autoplay]')
        ) {
          setPaused(true);
          plugin.stop();
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          event.defaultPrevented ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          (event.target as HTMLElement).closest(
            'input, textarea, select, [contenteditable="true"]',
          )
        )
          return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();

          navigate(() =>
            event.key === 'ArrowLeft'
              ? api?.scrollPrev(reduced)
              : api?.scrollNext(reduced),
          );
        }
      }}
    >
      <div
        ref={viewportRef}
        data-testid={partTestId(testId, 'viewport')}
        className={cn('overflow-hidden', classNames?.viewport)}
      >
        <div
          aria-live={playing ? 'off' : 'polite'}
          data-testid={partTestId(testId, 'container')}
          className={cn(
            'flex touch-pan-y gap-[var(--carousel-gap)] [--carousel-view:var(--carousel-base)] sm:[--carousel-view:var(--carousel-sm)] md:[--carousel-view:var(--carousel-md)] lg:[--carousel-view:var(--carousel-lg)] xl:[--carousel-view:var(--carousel-xl)]',
            classNames?.container,
          )}
        >
          {columns.map((column, columnIndex) => (
            <div
              key={getItemKey(column[0]!, columnIndex * count)}
              role="group"
              aria-roledescription="slide"
              aria-label={t('carousel.slide', {
                index: columnIndex + 1,
                count: columns.length,
              })}
              data-testid={partTestId(
                testId,
                'slide',
                String(getItemKey(column[0]!, columnIndex * count)),
              )}
              className={cn(
                'grid min-w-0 shrink-0 grow-0 basis-[calc((100%+var(--carousel-gap))/var(--carousel-view)-var(--carousel-gap))] gap-[var(--carousel-gap)]',
                classNames?.slide,
              )}
            >
              {column.map((item, row) => (
                <div key={getItemKey(item, columnIndex * count + row)}>
                  {renderItem(item, columnIndex * count + row)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div
        data-testid={partTestId(testId, 'controls')}
        className={cn(
          'mt-3 flex items-center justify-center gap-2',
          classNames?.controls,
        )}
      >
        {arrows && (
          <>
            <button
              type="button"
              aria-label={t('carousel.previous')}
              disabled={!canPrev}
              data-testid={partTestId(testId, 'prev')}
              className={cn(
                buttonClass,
                arrowPlacement === 'overlay' &&
                  'absolute left-2 top-1/2 -translate-y-1/2',
                classNames?.prev,
              )}
              onClick={() => navigate(() => api?.scrollPrev(reduced))}
            >
              <KitIcon
                name="chevronLeft"
                builtin={{ outline: ChevronLeftIcon, bold: ChevronLeftBoldIcon }}
              />
            </button>
            <button
              type="button"
              aria-label={t('carousel.next')}
              disabled={!canNext}
              data-testid={partTestId(testId, 'next')}
              className={cn(
                buttonClass,
                arrowPlacement === 'overlay' &&
                  'absolute right-2 top-1/2 -translate-y-1/2',
                classNames?.next,
              )}
              onClick={() => navigate(() => api?.scrollNext(reduced))}
            >
              <KitIcon
                name="chevronRight"
                builtin={{ outline: ChevronRightIcon, bold: ChevronRightBoldIcon }}
              />
            </button>
          </>
        )}
        {dots && (
          <div
            data-testid={partTestId(testId, 'dots')}
            className={cn('flex flex-wrap justify-center gap-1', classNames?.dots)}
          >
            {snaps.map((_, dot) => (
              <button
                key={dot}
                type="button"
                aria-label={t('carousel.goTo', { index: dot + 1 })}
                aria-current={selected === dot ? 'true' : undefined}
                data-testid={partTestId(testId, 'dot', dot)}
                className={cn(
                  'flex size-8 items-center justify-center rounded-full after:h-2 after:w-2 after:rounded-full after:bg-line after:transition-all motion-reduce:after:transition-none aria-[current=true]:after:w-5 aria-[current=true]:after:bg-brand-700',
                  focusRingClassName,
                  classNames?.dot,
                )}
                onClick={() => navigate(() => api?.scrollTo(dot, reduced))}
              />
            ))}
          </div>
        )}
        {autoplay && (
          <button
            type="button"
            data-carousel-autoplay=""
            disabled={!enabled || snaps.length <= 1}
            data-testid={partTestId(testId, 'autoplay')}
            className={cn(
              'rounded-control px-3 py-2 text-ui-sm text-ink',
              focusRingClassName,
              classNames?.autoplay,
            )}
            onClick={() => {
              if (playing) {
                setPaused(true);
                plugin.stop();
              } else {
                setPaused(false);
                if (enabled && api && api.scrollSnapList().length > 1) plugin.play();
              }
            }}
          >
            {t(playing ? 'carousel.pause' : 'carousel.play')}
          </button>
        )}
      </div>
    </div>
  );
}
