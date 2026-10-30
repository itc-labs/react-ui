'use client';

import { useRef, useState, type ComponentProps } from 'react';
import { cn, partTestId } from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import { Dialog, DialogContent, DialogTitle } from '../../components/dialog';
import { KitIconButton } from '../../components/icon-button/kit-icon-button';
import { ArrowLeftIcon } from '../../components/icon/outline/arrow-left';
import { ArrowLeftIcon as ArrowLeftBoldIcon } from '../../components/icon/bold/arrow-left';
import { ArrowRightIcon } from '../../components/icon/outline/arrow-right';
import { ArrowRightIcon as ArrowRightBoldIcon } from '../../components/icon/bold/arrow-right';
import { ZoomInIcon } from '../../components/icon/outline/zoom-in';
import { ZoomInIcon as ZoomInBoldIcon } from '../../components/icon/bold/zoom-in';
import { ZoomOutIcon } from '../../components/icon/outline/zoom-out';
import { ZoomOutIcon as ZoomOutBoldIcon } from '../../components/icon/bold/zoom-out';
import { UiImage } from '../../components/link-image-provider';
import { useUILocale } from '../../i18n/provider';
import type { MediaItem } from './index';
import { VideoPlayer, type RenderVideoPlayButton } from './video-player';

export type LightboxClassNames = Partial<
  Record<
    | 'root'
    | 'overlay'
    | 'close'
    | 'title'
    | 'toolbar'
    | 'counter'
    | 'navigationButton'
    | 'zoomButton'
    | 'viewport'
    | 'media'
    | 'video'
    | 'playButton'
    | 'videoControls'
    | 'thumbnails'
    | 'thumbnail',
    string
  >
>;
export interface LightboxProps extends Omit<
  ComponentProps<typeof DialogContent>,
  'children' | 'classNames'
> {
  items: readonly MediaItem[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Replaces the centered play button shown on paused videos. */
  renderPlayButton?: RenderVideoPlayButton | undefined;
  classNames?: LightboxClassNames;
}

export const clampMediaIndex = (value: number, count: number) =>
  Math.max(0, Math.min(count - 1, Number.isFinite(value) ? Math.floor(value) : 0));

// Controls sit on the dark stage, so they use inverted neutral colors.
const controlClass =
  'rounded-full border-0 bg-canvas/10 text-canvas hover:bg-canvas/20 disabled:bg-canvas/5 disabled:text-canvas/40';
const navigationClass = cn(controlClass, 'absolute top-1/2 z-10 -translate-y-1/2');

export function Lightbox({
  items,
  open,
  defaultOpen = false,
  onOpenChange,
  index,
  defaultIndex = 0,
  onIndexChange,
  renderPlayButton,
  className,
  classNames,
  'data-testid': testId,
  onKeyDown,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: LightboxProps) {
  const { t } = useUILocale();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const returnFocus = useRef<HTMLElement | null>(null);
  const isOpen = open ?? internalOpen;
  const active = clampMediaIndex(index ?? internalIndex, items.length);
  const item = items[active];

  const select = (next: number) => {
    const value = clampMediaIndex(next, items.length);
    if (!items.length || value === active) return;
    if (index === undefined) setInternalIndex(value);
    onIndexChange?.(value);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        if (open === undefined) setInternalOpen(next);
        onOpenChange?.(next);
      }}
    >
      <DialogContent
        {...props}
        data-testid={testId}
        aria-modal="true"
        aria-describedby={props['aria-describedby']}
        closeLabel={props.closeLabel ?? t('lightbox.close')}
        className={cn(
          'm-0 flex h-dvh max-h-none w-full max-w-none flex-col gap-3 overflow-hidden rounded-none border-0 bg-ink p-3 text-canvas sm:p-6 motion-reduce:animate-none',
          classNames?.root,
          className,
        )}
        classNames={{
          overlay: cn('motion-reduce:animate-none', classNames?.overlay),
          close: cn('text-canvas hover:bg-canvas/10', classNames?.close),
        }}
        onOpenAutoFocus={(event) => {
          returnFocus.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
          onOpenAutoFocus?.(event);
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event);
          if (!event.defaultPrevented && returnFocus.current?.isConnected) {
            event.preventDefault();
            returnFocus.current.focus();
          }
        }}
        onKeyDown={(event) => {
          event.stopPropagation();
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
        }}
      >
        <DialogTitle
          data-testid={partTestId(testId, 'title')}
          className={cn('sr-only', classNames?.title)}
        >
          {t('lightbox.label')}
        </DialogTitle>
        <div
          data-testid={partTestId(testId, 'toolbar')}
          className={cn(
            '-mt-1 flex h-10 shrink-0 items-center gap-2 pr-28 sm:-mt-4',
            classNames?.toolbar,
          )}
        >
          <KitIconButton
            icon="arrowLeft"
            builtin={{ outline: ArrowLeftIcon, bold: ArrowLeftBoldIcon }}
            label={t('lightbox.previous')}
            disabled={!items.length || active === 0}
            onClick={() => select(active - 1)}
            data-testid={partTestId(testId, 'previous')}
            className={cn(
              navigationClass,
              'left-3 sm:left-6',
              classNames?.navigationButton,
            )}
          />
          <span
            role="status"
            aria-live="polite"
            data-testid={partTestId(testId, 'counter')}
            className={cn('text-ui-sm tabular-nums', classNames?.counter)}
          >
            {t('lightbox.counter', {
              index: items.length ? active + 1 : 0,
              count: items.length,
            })}
          </span>
          <KitIconButton
            icon="arrowRight"
            builtin={{ outline: ArrowRightIcon, bold: ArrowRightBoldIcon }}
            label={t('lightbox.next')}
            disabled={!items.length || active === items.length - 1}
            onClick={() => select(active + 1)}
            data-testid={partTestId(testId, 'next')}
            className={cn(
              navigationClass,
              'right-3 sm:right-6',
              classNames?.navigationButton,
            )}
          />
        </div>
        {item && (
          <LightboxMedia
            key={`${isOpen}-${item.id}-${item.src}`}
            item={item}
            classNames={classNames}
            renderPlayButton={renderPlayButton}
            testId={testId}
          />
        )}
        <div
          role="group"
          aria-label={t('mediaGallery.thumbnails')}
          data-testid={partTestId(testId, 'thumbnails')}
          className={cn(
            'flex shrink-0 justify-center gap-2 overflow-auto p-1',
            classNames?.thumbnails,
          )}
        >
          {items.map((entry, entryIndex) => {
            const source =
              entry.thumbnail ?? (entry.type === 'video' ? entry.poster : entry.src);

            return (
              <button
                key={entry.id}
                type="button"
                ref={(node) => {
                  if (entryIndex === active)
                    node?.scrollIntoView?.({
                      block: 'nearest',
                      inline: 'nearest',
                      behavior: 'instant',
                    });
                }}
                aria-current={entryIndex === active ? 'true' : undefined}
                aria-label={t('mediaGallery.show', {
                  index: entryIndex + 1,
                  count: items.length,
                })}
                data-testid={partTestId(testId, 'thumbnail', entry.id)}
                className={cn(
                  'size-16 shrink-0 overflow-hidden rounded-control border border-line bg-canvas aria-[current=true]:ring-2 aria-[current=true]:ring-canvas',
                  focusRingClassName,
                  classNames?.thumbnail,
                )}
                onClick={() => select(entryIndex)}
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
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LightboxMedia({
  item,
  classNames,
  renderPlayButton,
  testId,
}: {
  item: MediaItem;
  classNames: LightboxClassNames | undefined;
  renderPlayButton: RenderVideoPlayButton | undefined;
  testId: string | undefined;
}) {
  const { t } = useUILocale();
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);

  const toggle = (next: boolean) => {
    setZoomed(next);
    setPan({ x: 0, y: 0 });
    drag.current = null;
  };

  return (
    <>
      <div className="absolute right-14 top-2 z-10 flex gap-2">
        <KitIconButton
          icon="zoomIn"
          builtin={{ outline: ZoomInIcon, bold: ZoomInBoldIcon }}
          label={t('lightbox.zoomIn')}
          disabled={item.type === 'video'}
          aria-pressed={zoomed}
          onClick={() => toggle(true)}
          data-testid={partTestId(testId, 'zoomIn')}
          className={cn(controlClass, classNames?.zoomButton)}
        />
        <KitIconButton
          icon="zoomOut"
          builtin={{ outline: ZoomOutIcon, bold: ZoomOutBoldIcon }}
          label={t('lightbox.zoomOut')}
          disabled={!zoomed}
          onClick={() => toggle(false)}
          data-testid={partTestId(testId, 'zoomOut')}
          className={cn(controlClass, classNames?.zoomButton)}
        />
      </div>
      <div
        data-testid={partTestId(testId, 'viewport')}
        className={cn(
          'relative flex min-h-0 flex-1 items-center justify-center overflow-hidden',
          zoomed && 'cursor-grab touch-none active:cursor-grabbing',
          classNames?.viewport,
        )}
        onDoubleClick={() => {
          if (item.type !== 'video') toggle(!zoomed);
        }}
        onPointerDown={(event) => {
          if (!zoomed || event.button !== 0) return;
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = {
            id: event.pointerId,
            x: event.clientX - pan.x,
            y: event.clientY - pan.y,
          };
        }}
        onPointerMove={(event) => {
          if (!drag.current || drag.current.id !== event.pointerId) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          setPan({
            x: Math.max(
              -bounds.width / 2,
              Math.min(bounds.width / 2, event.clientX - drag.current.x),
            ),
            y: Math.max(
              -bounds.height / 2,
              Math.min(bounds.height / 2, event.clientY - drag.current.y),
            ),
          });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        {item.type === 'video' ? (
          <VideoPlayer
            src={item.src}
            poster={item.poster}
            label={item.alt}
            renderPlayButton={renderPlayButton}
            testId={partTestId(testId, 'video')}
            videoClassName={cn(focusRingClassName, classNames?.media)}
            classNames={{
              video: classNames?.video,
              playButton: classNames?.playButton,
              controls: classNames?.videoControls,
            }}
          />
        ) : (
          <UiImage
            src={item.src}
            alt={item.alt}
            {...(item.width === undefined ? {} : { width: item.width })}
            {...(item.height === undefined ? {} : { height: item.height })}
            draggable={false}
            data-testid={partTestId(testId, 'media')}
            className={cn(
              'h-full w-full select-none object-contain',
              classNames?.media,
            )}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomed ? 2 : 1})`,
            }}
          />
        )}
      </div>
    </>
  );
}
