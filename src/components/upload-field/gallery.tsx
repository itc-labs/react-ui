'use client';

import { lazy, Suspense, useRef, useState, type Ref } from 'react';
import { cn, partTestId } from '../common';
import { focusRingClassName } from '../common/focus-ring';
import { KitIcon } from '../icon/kit-icon';
import { KitIconButton } from '../icon-button/kit-icon-button';
import { IconButton } from '../icon-button';
import { PlusIcon } from '../icon/outline/plus';
import { PlusIcon as PlusBoldIcon } from '../icon/bold/plus';
import { ViewIcon } from '../icon/outline/view';
import { ViewIcon as ViewBoldIcon } from '../icon/bold/view';
import { CloseIcon } from '../icon/outline/close';
import { CloseIcon as CloseBoldIcon } from '../icon/bold/close';
import { RefreshIcon } from '../icon/outline/refresh';
import { RefreshIcon as RefreshBoldIcon } from '../icon/bold/refresh';
import { WarningIcon } from '../icon/outline/warning';
import { WarningIcon as WarningBoldIcon } from '../icon/bold/warning';
import { Progress } from '../progress';
import { Tooltip } from '../tooltip';
import { UiImage } from '../link-image-provider';
import { useUILocale } from '../../i18n/provider';
import { UploadSort } from './upload-sort';
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
  sortable,
  onItemsReorder,
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
  sortable: boolean;
  onItemsReorder: UploadFieldProps['onItemsReorder'];
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
      <UploadSort
        enabled={sortable}
        blocked={blocked}
        orientation="grid"
        items={items.map((item) => ({
          id: item.id,
          label: item.alt,
          disabled: Boolean(item.status && item.status !== 'idle'),
        }))}
        leading={items.length < maxFiles ? 1 : 0}
        onReorder={(ids) => onItemsReorder?.(ids)}
      >
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
                  invalid && 'border-danger-700 text-danger-700',
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
                aria-current={item.selected ? 'true' : undefined}
                className={cn(
                  'group relative aspect-square min-w-0 overflow-hidden rounded-control border border-line bg-surface',
                  item.selected && 'ring-2 ring-accent ring-offset-2',
                  classNames?.tile,
                )}
              >
                <UiImage
                  src={item.src}
                  alt={item.alt}
                  data-testid={partTestId(testId, 'tileImage', item.id)}
                  className={cn('size-full object-cover', classNames?.tileImage)}
                />
                {(uploading || failed) && (
                  <div
                    aria-hidden="true"
                    data-testid={partTestId(testId, 'tileOverlay', item.id)}
                    className={cn(
                      // Top padding keeps the ring and icon clear of the action buttons on small tiles.
                      'pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-2 pt-9 pb-2 text-on-media',
                      failed ? 'bg-media-scrim-danger/75' : 'bg-media-scrim/60',
                      classNames?.tileOverlay,
                    )}
                  >
                    {uploading ? (
                      <Progress
                        variant="circular"
                        size={52}
                        thickness={3}
                        value={percent}
                        indeterminate={percent === 0}
                        data-testid={partTestId(testId, 'tileProgress', item.id)}
                        className={classNames?.tileProgress}
                        classNames={{
                          track: 'text-on-media/25',
                          indicator: 'text-on-media',
                          center:
                            'p-0 text-ui-sm font-medium text-on-media tabular-nums',
                        }}
                      >
                        {percent > 0 ? `${percent}%` : null}
                      </Progress>
                    ) : (
                      <KitIcon
                        name="warning"
                        builtin={{ outline: WarningIcon, bold: WarningBoldIcon }}
                        size={32}
                      />
                    )}
                    <span
                      data-testid={partTestId(testId, 'tileCaption', item.id)}
                      className={cn(
                        'text-center text-ui-sm max-sm:sr-only',
                        classNames?.tileCaption,
                      )}
                    >
                      {t(failed ? 'upload.failedCaption' : 'upload.uploadingCaption')}
                    </span>
                  </div>
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
                  {!uploading &&
                    !failed &&
                    item.actions?.map((action) => (
                      <Tooltip key={action.id} content={action.label}>
                        <IconButton
                          icon={action.icon}
                          variant="secondary"
                          {...(action.tone === 'danger' ? { tone: 'danger' } : {})}
                          size="sm"
                          label={`${action.label} ${item.alt}`}
                          disabled={blocked || action.disabled}
                          onClick={() => action.onSelect()}
                        />
                      </Tooltip>
                    ))}
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
                    <Tooltip content={item.error || t('upload.imageError')}>
                      <KitIconButton
                        icon="refresh"
                        builtin={{ outline: RefreshIcon, bold: RefreshBoldIcon }}
                        variant="secondary"
                        size="sm"
                        label={t('upload.retry', { name: item.alt })}
                        disabled={blocked}
                        onClick={() => onItemRetry(item.id)}
                      />
                    </Tooltip>
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
                    aria-live="polite"
                    data-testid={partTestId(testId, 'tileStatus', item.id)}
                    className={cn('sr-only', classNames?.tileStatus)}
                  >
                    {failed
                      ? item.error || t('upload.imageError')
                      : t('upload.uploading', { percent })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </UploadSort>
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
