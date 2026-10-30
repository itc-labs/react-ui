'use client';

import { useEffect, useRef, useState, type ComponentPropsWithRef } from 'react';
import { cn, partTestId } from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import { KitIcon } from '../../components/icon/kit-icon';
import { PlayIcon } from '../../components/icon/outline/play';
import { PlayIcon as PlayBoldIcon } from '../../components/icon/bold/play';
import { UiImage } from '../../components/link-image-provider';
import { useUILocale } from '../../i18n/provider';
import { Carousel } from '../carousel';

export interface MediaItem {
  id: string;
  type?: 'image' | 'video';
  src: string;
  alt: string;
  thumbnail?: string;
  poster?: string;
  width?: number;
  height?: number;
}
export type MediaGalleryClassNames = Partial<
  Record<
    'root' | 'main' | 'slide' | 'media' | 'thumbnails' | 'thumbnail' | 'video',
    string
  >
>;
export interface MediaGalleryProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'onOpen'
> {
  items: readonly MediaItem[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Left on desktop and bottom on small screens when omitted. */
  thumbnails?: 'left' | 'bottom' | 'none';
  aspectRatio?: string;
  onOpen?: (index: number) => void;
  classNames?: MediaGalleryClassNames;
  'data-testid'?: string;
}

const clampIndex = (value: number, count: number) =>
  Math.max(0, Math.min(count - 1, Number.isFinite(value) ? Math.floor(value) : 0));

export function MediaGallery({
  items,
  index,
  defaultIndex = 0,
  onIndexChange,
  thumbnails,
  aspectRatio = '1 / 1',
  onOpen,
  className,
  classNames,
  'data-testid': testId,
  onKeyDown,
  ...props
}: MediaGalleryProps) {
  const { t } = useUILocale();
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const active = clampIndex(index ?? internalIndex, items.length);
  const thumbnailRefs = useRef(new Map<string, HTMLButtonElement>());
  const videoRefs = useRef(new Map<string, HTMLVideoElement>());
  const activeId = items[active]?.id;
  const left = thumbnails === 'left' || thumbnails === undefined;

  useEffect(() => {
    thumbnailRefs.current.get(activeId ?? '')?.scrollIntoView?.({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'instant',
    });

    videoRefs.current.forEach((video, id) => {
      if (id !== activeId) video.pause();
    });
  }, [activeId, thumbnails]);

  const select = (next: number) => {
    const value = clampIndex(next, items.length);
    if (!items.length || value === active) return;
    if (index === undefined) setInternalIndex(value);
    onIndexChange?.(value);
  };

  const handleKeyDown: NonNullable<MediaGalleryProps['onKeyDown']> = (event) => {
    if (event.defaultPrevented) return;
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
      select(active + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  };

  return (
    <div
      {...props}
      role={props.role ?? 'region'}
      aria-label={props['aria-label'] ?? t('mediaGallery.label')}
      tabIndex={props.tabIndex ?? 0}
      data-testid={testId}
      className={cn(
        'grid min-w-0 gap-3',
        left && 'md:grid-cols-[5rem_minmax(0,1fr)]',
        focusRingClassName,
        classNames?.root,
        className,
      )}
      onKeyDown={handleKeyDown}
    >
      <Carousel
        items={items}
        getItemKey={(item) => item.id}
        index={active}
        defaultIndex={active}
        onSlideChange={select}
        gap={0}
        arrowPlacement="overlay"
        tabIndex={-1}
        role="group"
        aria-label={t('mediaGallery.label')}
        {...(testId === undefined
          ? {}
          : { 'data-testid': partTestId(testId, 'main')! })}
        className={cn(
          'min-w-0',
          left && 'md:col-start-2 md:row-start-1',
          classNames?.main,
        )}
        onKeyDown={(event) => {
          event.stopPropagation();
          handleKeyDown(event);
        }}
        renderItem={(item, itemIndex) => (
          <div
            inert={itemIndex !== active}
            aria-hidden={itemIndex !== active || undefined}
            data-testid={partTestId(testId, 'slide', item.id)}
            className={cn(
              'relative overflow-hidden rounded-panel bg-canvas',
              classNames?.slide,
            )}
            style={{ aspectRatio }}
          >
            {item.type === 'video' ? (
              <video
                ref={(node) => {
                  if (node) videoRefs.current.set(item.id, node);
                  else videoRefs.current.delete(item.id);
                }}
                src={item.src}
                poster={item.poster}
                width={item.width}
                height={item.height}
                controls
                playsInline
                preload="metadata"
                aria-label={item.alt}
                data-testid={partTestId(testId, 'video', item.id)}
                className={cn(
                  'h-full w-full object-contain',
                  focusRingClassName,
                  classNames?.media,
                  classNames?.video,
                )}
                onClick={() => onOpen?.(itemIndex)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') onOpen?.(itemIndex);
                }}
              />
            ) : (
              <button
                type="button"
                disabled={!onOpen}
                aria-label={t('mediaGallery.open', {
                  index: itemIndex + 1,
                  count: items.length,
                })}
                className={cn(
                  'block h-full w-full disabled:cursor-default',
                  focusRingClassName,
                )}
                onClick={() => onOpen?.(itemIndex)}
              >
                <UiImage
                  src={item.src}
                  alt={item.alt}
                  {...(item.width === undefined ? {} : { width: item.width })}
                  {...(item.height === undefined ? {} : { height: item.height })}
                  draggable={false}
                  data-testid={partTestId(testId, 'media', item.id)}
                  className={cn('h-full w-full object-contain', classNames?.media)}
                />
              </button>
            )}
          </div>
        )}
      />
      {thumbnails !== 'none' && (
        <div
          role="group"
          aria-label={t('mediaGallery.thumbnails')}
          data-testid={partTestId(testId, 'thumbnails')}
          className={cn(
            'flex min-h-0 min-w-0 gap-2 overflow-auto p-1',
            left &&
              'md:col-start-1 md:row-start-1 md:max-h-full md:flex-col md:[height:0] md:[min-height:100%]',
            classNames?.thumbnails,
          )}
        >
          {items.map((item, itemIndex) => {
            const source =
              item.thumbnail ?? (item.type === 'video' ? item.poster : item.src);

            return (
              <button
                key={item.id}
                ref={(node) => {
                  if (node) thumbnailRefs.current.set(item.id, node);
                  else thumbnailRefs.current.delete(item.id);
                }}
                type="button"
                aria-current={active === itemIndex ? 'true' : undefined}
                aria-label={t('mediaGallery.show', {
                  index: itemIndex + 1,
                  count: items.length,
                })}
                data-testid={partTestId(testId, 'thumbnail', item.id)}
                className={cn(
                  'relative size-16 shrink-0 overflow-hidden rounded-control border border-line bg-canvas aria-[current=true]:border-brand-700 aria-[current=true]:ring-2 aria-[current=true]:ring-brand-700',
                  focusRingClassName,
                  classNames?.thumbnail,
                )}
                onClick={() => select(itemIndex)}
              >
                {source && (
                  <UiImage
                    src={source}
                    alt=""
                    width={64}
                    height={64}
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                )}
                {item.type === 'video' && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center text-ink"
                  >
                    <span className="rounded-full bg-surface p-1">
                      <KitIcon
                        name="play"
                        builtin={{ outline: PlayIcon, bold: PlayBoldIcon }}
                        size={20}
                      />
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
