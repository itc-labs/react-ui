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
import { Lightbox, clampMediaIndex } from './lightbox';
import { VideoPlayer, type RenderVideoPlayButton } from './video-player';
export { Lightbox } from './lightbox';
export type { LightboxProps, LightboxClassNames } from './lightbox';
export type { RenderVideoPlayButton, VideoPlayButtonState } from './video-player';

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
    | 'root'
    | 'main'
    | 'slide'
    | 'media'
    | 'thumbnails'
    | 'thumbnail'
    | 'video'
    | 'playButton'
    | 'videoControls',
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
  /** How images fill the frame: `cover` crops to fill, `contain` shows the whole image. */
  fit?: 'cover' | 'contain';
  zoom?: boolean;
  zoomScale?: number;
  lightbox?: boolean;
  onOpen?: (index: number) => void;
  /** Replaces the centered play button shown on paused videos. */
  renderPlayButton?: RenderVideoPlayButton;
  classNames?: MediaGalleryClassNames;
  'data-testid'?: string;
}

export function MediaGallery({
  items,
  index,
  defaultIndex = 0,
  onIndexChange,
  thumbnails,
  aspectRatio = '1 / 1',
  fit = 'cover',
  zoom = true,
  zoomScale = 2,
  lightbox = true,
  onOpen,
  renderPlayButton,
  className,
  classNames,
  'data-testid': testId,
  onKeyDown,
  ...props
}: MediaGalleryProps) {
  const { t } = useUILocale();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);

  const openMedia = (itemIndex: number) => {
    setHover(null);
    if (lightbox) setLightboxOpen(true);
    onOpen?.(itemIndex);
  };

  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const active = clampMediaIndex(index ?? internalIndex, items.length);
  const mediaRefs = useRef(new Map<string, HTMLButtonElement | HTMLVideoElement>());
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
      if (lightboxOpen || id !== activeId) video.pause();
    });
  }, [activeId, thumbnails, lightboxOpen]);

  useEffect(() => {
    setHover(null);
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    const reset = () => setHover(null);

    fine.addEventListener('change', reset);
    reduced.addEventListener('change', reset);

    return () => {
      fine.removeEventListener('change', reset);
      reduced.removeEventListener('change', reset);
    };
  }, [activeId, zoom]);

  const select = (next: number) => {
    const value = clampMediaIndex(next, items.length);
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
              <VideoPlayer
                ref={(node) => {
                  if (node) {
                    videoRefs.current.set(item.id, node);
                    mediaRefs.current.set(item.id, node);
                  } else {
                    videoRefs.current.delete(item.id);
                    mediaRefs.current.delete(item.id);
                  }
                }}
                src={item.src}
                poster={item.poster}
                label={item.alt}
                fit={fit}
                renderPlayButton={renderPlayButton}
                testId={partTestId(testId, 'video', item.id)}
                videoClassName={cn(focusRingClassName, classNames?.media)}
                classNames={{
                  video: classNames?.video,
                  playButton: classNames?.playButton,
                  controls: classNames?.videoControls,
                }}
              />
            ) : (
              <button
                type="button"
                ref={(node) => {
                  if (node) mediaRefs.current.set(item.id, node);
                  else mediaRefs.current.delete(item.id);
                }}
                disabled={!onOpen && !lightbox}
                aria-label={t('mediaGallery.open', {
                  index: itemIndex + 1,
                  count: items.length,
                })}
                className={cn(
                  'block h-full w-full disabled:cursor-default',
                  focusRingClassName,
                )}
                onClick={() => openMedia(itemIndex)}
                onPointerMove={(event) => {
                  if (
                    !zoom ||
                    event.pointerType !== 'mouse' ||
                    !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
                    window.matchMedia('(prefers-reduced-motion: reduce)').matches
                  ) {
                    setHover(null);

                    return;
                  }
                  const bounds = event.currentTarget.getBoundingClientRect();
                  if (!bounds.width || !bounds.height) return;
                  setHover({
                    id: item.id,
                    x: Math.max(
                      0,
                      Math.min(
                        100,
                        ((event.clientX - bounds.left) / bounds.width) * 100,
                      ),
                    ),
                    y: Math.max(
                      0,
                      Math.min(
                        100,
                        ((event.clientY - bounds.top) / bounds.height) * 100,
                      ),
                    ),
                  });
                }}
                onPointerLeave={() => setHover(null)}
                onPointerCancel={() => setHover(null)}
                onBlur={() => setHover(null)}
              >
                <UiImage
                  src={item.src}
                  alt={item.alt}
                  {...(item.width === undefined ? {} : { width: item.width })}
                  {...(item.height === undefined ? {} : { height: item.height })}
                  draggable={false}
                  style={{
                    transform: `scale(${zoom && hover?.id === item.id && itemIndex === active ? (Number.isFinite(zoomScale) ? Math.max(1, zoomScale) : 2) : 1})`,
                    transformOrigin:
                      hover?.id === item.id ? `${hover.x}% ${hover.y}%` : '50% 50%',
                  }}
                  data-testid={partTestId(testId, 'media', item.id)}
                  className={cn(
                    'h-full w-full',
                    fit === 'cover' ? 'object-cover' : 'object-contain',
                    classNames?.media,
                  )}
                />
              </button>
            )}
          </div>
        )}
      />
      {lightbox && (
        <Lightbox
          items={items}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          onCloseAutoFocus={(event) => {
            const target = mediaRefs.current.get(activeId ?? '');
            if (target) {
              event.preventDefault();
              target.focus();
            }
          }}
          index={active}
          onIndexChange={select}
          renderPlayButton={renderPlayButton}
          data-testid={partTestId(testId, 'lightbox')}
        />
      )}
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
