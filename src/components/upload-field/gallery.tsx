'use client';

import { lazy, Suspense, useRef, useState, type Ref } from 'react';
import { cn, partTestId } from '../common';
import { focusRingClassName } from '../common/focus-ring';
import { KitIcon } from '../icon/kit-icon';
import { KitIconButton } from '../icon-button/kit-icon-button';
import { PlusIcon } from '../icon/outline/plus';
import { PlusIcon as PlusBoldIcon } from '../icon/bold/plus';
import { ViewIcon } from '../icon/outline/view';
import { ViewIcon as ViewBoldIcon } from '../icon/bold/view';
import { CloseIcon } from '../icon/outline/close';
import { CloseIcon as CloseBoldIcon } from '../icon/bold/close';
import { RefreshIcon } from '../icon/outline/refresh';
import { RefreshIcon as RefreshBoldIcon } from '../icon/bold/refresh';
import { UiImage } from '../link-image-provider';
import { useUILocale } from '../../i18n/provider';
import type { UploadFieldProps, UploadGalleryItem } from './types';

const Lightbox = /* @__PURE__ */ lazy(() =>
  import('../../modules/media-gallery/lightbox').then((module) => ({
    default: module.Lightbox,
  })),
);

export function UploadGallery({
  testId,
  controlId,
  label,
  describedBy,
  invalid,
  items,
  blocked,
  maxFiles,
  classNames,
  triggerRef,
  onPick,
  onOpenPicker,
  onBlur,
  onItemRemove,
  onItemRetry,
}: {
  testId: string | undefined;
  controlId: string;
  label: string;
  describedBy: string | undefined;
  invalid: boolean;
  items: readonly UploadGalleryItem[];
  blocked: boolean;
  maxFiles: number;
  classNames: UploadFieldProps['classNames'];
  triggerRef: Ref<HTMLButtonElement>;
  onPick: (files: File[]) => void;
  onOpenPicker: () => void;
  onBlur: UploadFieldProps['onBlur'];
  onItemRemove: UploadFieldProps['onItemRemove'];
  onItemRetry: UploadFieldProps['onItemRetry'];
}) {
  const { t } = useUILocale();
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);
  const [previewId, setPreviewId] = useState<string>();
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const idleItems = items.filter((item) => !item.status || item.status === 'idle');
  const previewIndex = idleItems.findIndex((item) => item.id === previewId);

  return (
    <>
      <ul
        data-testid={partTestId(testId, 'grid')}
        aria-label={label}
        aria-describedby={describedBy}
        className={cn(
          'grid grid-cols-3 gap-2 rounded-control sm:grid-cols-4 lg:grid-cols-6',
          dragging && 'bg-hover ring-2 ring-accent ring-offset-2',
          classNames?.grid,
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          dragDepth.current += 1;
          if (!blocked) setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = blocked ? 'none' : 'copy';
        }}
        onDragLeave={() => {
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (!dragDepth.current) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          onPick(Array.from(event.dataTransfer.files));
        }}
      >
        {items.length < maxFiles && (
          <li className="aspect-square min-w-0">
            <button
              type="button"
              id={controlId}
              ref={triggerRef}
              data-testid={partTestId(testId, 'addTile')}
              disabled={blocked}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              onClick={onOpenPicker}
              onBlur={onBlur}
              className={cn(
                'flex size-full flex-col items-center justify-center gap-1 rounded-control border border-dashed border-control-border bg-surface p-2 text-ui-sm text-muted hover:bg-hover disabled:cursor-not-allowed disabled:opacity-60',
                focusRingClassName,
                classNames?.addTile,
              )}
            >
              <KitIcon
                name="plus"
                builtin={{ outline: PlusIcon, bold: PlusBoldIcon }}
              />
              {t('upload.addImages')}
            </button>
          </li>
        )}
        {items.map((item) => {
          const uploading = item.status === 'uploading';
          const failed = item.status === 'error';
          const percent = Number.isFinite(item.progress)
            ? Math.max(0, Math.min(100, item.progress!))
            : 0;

          return (
            <li
              key={item.id}
              data-testid={partTestId(testId, 'tile', item.id)}
              className={cn(
                'group relative aspect-square min-w-0 overflow-hidden rounded-control border border-line bg-surface',
                classNames?.tile,
              )}
            >
              <UiImage
                src={item.src}
                alt={item.alt}
                data-testid={partTestId(testId, 'tileImage', item.id)}
                className={cn(
                  'size-full object-cover',
                  (uploading || failed) && 'opacity-40',
                  classNames?.tileImage,
                )}
              />
              {failed && (
                <div aria-hidden="true" className="absolute inset-0 bg-danger-50/80" />
              )}
              {item.badge != null && (
                <div
                  data-testid={partTestId(testId, 'tileBadge', item.id)}
                  className={cn('absolute bottom-1 start-1', classNames?.tileBadge)}
                >
                  {item.badge}
                </div>
              )}
              <div
                data-testid={partTestId(testId, 'tileActions', item.id)}
                className={cn(
                  'absolute end-1 top-1 flex gap-1 transition-opacity',
                  !failed &&
                    'sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 [@media(hover:none)]:opacity-100',
                  classNames?.tileActions,
                )}
              >
                {!uploading && !failed && (
                  <KitIconButton
                    icon="view"
                    builtin={{ outline: ViewIcon, bold: ViewBoldIcon }}
                    variant="secondary"
                    size="sm"
                    label={t('upload.preview', { name: item.alt })}
                    onClick={(event) => {
                      returnFocus.current = event.currentTarget;
                      setPreviewId(item.id);
                    }}
                  />
                )}
                {failed && onItemRetry && (
                  <KitIconButton
                    icon="refresh"
                    builtin={{ outline: RefreshIcon, bold: RefreshBoldIcon }}
                    variant="secondary"
                    size="sm"
                    label={t('upload.retry', { name: item.alt })}
                    disabled={blocked}
                    onClick={() => onItemRetry(item.id)}
                  />
                )}
                {onItemRemove && (
                  <KitIconButton
                    icon="close"
                    builtin={{ outline: CloseIcon, bold: CloseBoldIcon }}
                    variant="secondary"
                    size="sm"
                    label={t('upload.remove', { name: item.alt })}
                    disabled={blocked}
                    onClick={() => onItemRemove(item.id)}
                  />
                )}
              </div>
              {(uploading || failed) && (
                <div
                  role="status"
                  data-testid={partTestId(testId, 'tileStatus', item.id)}
                  className={cn(
                    'absolute inset-x-0 bottom-0 grid gap-1 bg-surface/90 p-2 text-ui-sm',
                    failed ? 'text-danger-700' : 'text-ink',
                    classNames?.tileStatus,
                  )}
                >
                  {failed
                    ? item.error || t('upload.imageError')
                    : t('upload.uploading', { percent })}
                  {uploading && (
                    <progress
                      max={100}
                      value={percent}
                      aria-label={t('upload.progress')}
                      className="w-full accent-brand-700"
                    />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {previewIndex >= 0 && (
        <Suspense fallback={null}>
          <Lightbox
            items={idleItems}
            open
            index={previewIndex}
            onIndexChange={(index) => setPreviewId(idleItems[index]?.id)}
            onOpenChange={(open) => {
              if (!open) setPreviewId(undefined);
            }}
            onCloseAutoFocus={(event) => {
              if (returnFocus.current?.isConnected) {
                event.preventDefault();
                returnFocus.current.focus();
              }
            }}
            data-testid={partTestId(testId, 'lightbox')}
          />
        </Suspense>
      )}
    </>
  );
}
