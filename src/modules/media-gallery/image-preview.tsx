'use client';

import { useRef, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import {
  cn,
  partTestId,
  type SlotClasses,
  type TestIdProps,
} from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import { KitIcon } from '../../components/icon/kit-icon';
import { ImageIcon } from '../../components/icon/outline/image';
import { ImageIcon as ImageBoldIcon } from '../../components/icon/bold/image';
import { PlayIcon } from '../../components/icon/outline/play';
import { PlayIcon as PlayBoldIcon } from '../../components/icon/bold/play';
import { UiImage } from '../../components/link-image-provider';
import { useUILocale } from '../../i18n/provider';
import type { MediaItem } from './index';
import { Lightbox } from './lightbox';

export type ImagePreviewClassNames = SlotClasses<
  'root' | 'item' | 'image' | 'more' | 'empty' | 'lightbox'
>;
export type ImagePreviewProps = Omit<ComponentPropsWithRef<'div'>, 'children'> &
  TestIdProps & {
    items: readonly MediaItem[];
    size?: 'sm' | 'md' | 'lg' | 'xl';
    shape?: 'rounded' | 'circle';
    /** Thumbnails shown before a "+N" tile; every item stays reachable in the lightbox. */
    maxVisible?: number;
    /** Opens the fullscreen Lightbox on click (default). Set false to handle `onOpen` yourself. */
    lightbox?: boolean;
    onOpen?: (index: number) => void;
    /** Rendered when `items` is empty; defaults to a localized image placeholder. */
    emptyFallback?: ReactNode;
    classNames?: ImagePreviewClassNames;
  };

const sizes = {
  sm: 'size-control-sm',
  md: 'size-control-lg',
  lg: 'size-16',
  xl: 'size-24',
} as const;
const pixels = { sm: 32, md: 48, lg: 64, xl: 96 } as const;
const iconSizes = { sm: 16, md: 20, lg: 24, xl: 32 } as const;

/** Compact image thumbnails, one or many, that open a fullscreen zoomable viewer. */
export function ImagePreview({
  items,
  size = 'md',
  shape = 'rounded',
  maxVisible,
  lightbox = true,
  onOpen,
  emptyFallback,
  className,
  classNames,
  'data-testid': testId,
  'aria-label': ariaLabel,
  ...props
}: ImagePreviewProps) {
  const { t } = useUILocale();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const triggers = useRef(new Map<number, HTMLButtonElement>());
  const opener = useRef(0);

  const limit =
    maxVisible !== undefined && Number.isFinite(maxVisible)
      ? Math.max(1, Math.floor(maxVisible))
      : items.length;
  const visible = items.slice(0, limit);
  const hiddenCount = items.length - visible.length;
  const interactive = lightbox || Boolean(onOpen);
  const tileClassName = cn(
    'relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-line bg-canvas',
    sizes[size],
    shape === 'circle' ? 'rounded-full' : 'rounded-control',
  );

  const show = (target: number, trigger: number) => {
    opener.current = trigger;
    setIndex(target);
    onOpen?.(target);
    if (lightbox) setOpen(true);
  };

  if (!items.length)
    return (
      <div
        {...props}
        data-testid={testId}
        aria-label={ariaLabel}
        className={cn('inline-flex', classNames?.root, className)}
      >
        {emptyFallback ?? (
          <span
            role="img"
            aria-label={t('imagePreview.empty')}
            data-testid={partTestId(testId, 'empty')}
            className={cn(tileClassName, 'text-muted', classNames?.empty)}
          >
            <KitIcon
              name="image"
              builtin={{ outline: ImageIcon, bold: ImageBoldIcon }}
              size={iconSizes[size]}
              aria-hidden="true"
            />
          </span>
        )}
      </div>
    );

  return (
    <div
      role="group"
      aria-label={ariaLabel ?? t('imagePreview.label', { count: items.length })}
      {...props}
      data-testid={testId}
      className={cn('flex flex-wrap items-center gap-2', classNames?.root, className)}
    >
      {visible.map((item, itemIndex) => {
        const source =
          item.thumbnail ?? (item.type === 'video' ? item.poster : item.src);
        const content = (
          <>
            {source && (
              <UiImage
                src={source}
                alt=""
                width={pixels[size]}
                height={pixels[size]}
                draggable={false}
                data-testid={partTestId(testId, 'image', item.id)}
                className={cn('size-full object-cover', classNames?.image)}
              />
            )}
            {item.type === 'video' && (
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center text-ink"
              >
                <span className="rounded-full bg-surface p-0.5">
                  <KitIcon
                    name="play"
                    builtin={{ outline: PlayIcon, bold: PlayBoldIcon }}
                    size={Math.max(12, iconSizes[size] - 4)}
                  />
                </span>
              </span>
            )}
          </>
        );
        const label = t('imagePreview.open', {
          name: item.alt,
          index: itemIndex + 1,
          count: items.length,
        });

        return interactive ? (
          <button
            key={item.id}
            ref={(node) => {
              if (node) triggers.current.set(itemIndex, node);
              else triggers.current.delete(itemIndex);
            }}
            type="button"
            aria-label={label}
            data-testid={partTestId(testId, 'item', item.id)}
            className={cn(
              tileClassName,
              'cursor-zoom-in motion-safe:transition-shadow hover:ring-2 hover:ring-control-border',
              focusRingClassName,
              classNames?.item,
            )}
            onClick={() => show(itemIndex, itemIndex)}
          >
            {content}
          </button>
        ) : (
          <span
            key={item.id}
            role="img"
            aria-label={item.alt}
            data-testid={partTestId(testId, 'item', item.id)}
            className={cn(tileClassName, classNames?.item)}
          >
            {content}
          </span>
        );
      })}
      {hiddenCount > 0 && (
        <button
          ref={(node) => {
            if (node) triggers.current.set(limit, node);
            else triggers.current.delete(limit);
          }}
          type="button"
          disabled={!interactive}
          aria-label={t('imagePreview.more', { count: hiddenCount })}
          data-testid={partTestId(testId, 'more')}
          className={cn(
            tileClassName,
            'text-ui-sm font-medium text-ink enabled:cursor-zoom-in enabled:hover:bg-hover',
            focusRingClassName,
            classNames?.more,
          )}
          onClick={() => show(limit, limit)}
        >
          {t('optionGroup.more', { count: hiddenCount })}
        </button>
      )}
      {lightbox && (
        <Lightbox
          items={items}
          open={open}
          onOpenChange={setOpen}
          index={index}
          onIndexChange={setIndex}
          onCloseAutoFocus={(event) => {
            const target = triggers.current.get(opener.current);
            if (target) {
              event.preventDefault();
              target.focus();
            }
          }}
          className={classNames?.lightbox}
          data-testid={partTestId(testId, 'lightbox')}
        />
      )}
    </div>
  );
}
