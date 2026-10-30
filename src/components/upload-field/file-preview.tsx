'use client';

import { KitIcon } from '../icon/kit-icon';
import { FileIcon } from '../icon/outline/file';
import { FileIcon as FileBoldIcon } from '../icon/bold/file';
import { UiImage, UiLink } from '../link-image-provider';
import { useUILocale } from '../../i18n/provider';
import { useEffect, useState } from 'react';
import { useObjectUrl } from '../common/use-object-url';
import { partTestId } from '../common/testing';
import { cn } from '../common';
import { focusRingClassName } from '../common/focus-ring';
import type { UploadFieldProps } from './index';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '../dialog';

export function FilePreview({
  'data-testid': testId,
  file,
  disabled,
  classNames,
}: {
  'data-testid'?: string | undefined;
  file: File;
  disabled: boolean;
  classNames?: UploadFieldProps['classNames'];
}) {
  const { t, locale } = useUILocale();
  const url = useObjectUrl(file),
    image = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
      'image/avif',
    ].includes(file.type);
  const text = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
  const [content, setContent] = useState<string>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    setContent(undefined);
    let cancelled = false;
    if (text && file.size <= 1024 * 1024)
      void file
        .text()
        .then((value) => {
          if (!cancelled) setContent(value);
        })
        .catch(() => {
          if (!cancelled) setFailed(true);
        });

    return () => {
      cancelled = true;
    };
  }, [file, text]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          data-testid={testId}
          type="button"
          disabled={disabled}
          aria-label={t('upload.preview', { name: file.name })}
          className={cn(
            'flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-control border border-line bg-canvas text-muted hover:border-accent focus-visible:outline-offset-2 disabled:cursor-not-allowed',
            focusRingClassName,
            classNames?.previewTrigger,
          )}
        >
          {image && url && !failed ? (
            <UiImage
              src={url}
              alt=""
              className={cn('size-full object-cover', classNames?.thumbnail)}
              onError={() => setFailed(true)}
            />
          ) : (
            <KitIcon
              name="file"
              builtin={{ outline: FileIcon, bold: FileBoldIcon }}
              size={24}
            />
          )}
        </button>
      </DialogTrigger>
      <DialogContent
        data-testid={partTestId(testId, 'dialog')}
        classNames={{
          overlay: classNames?.previewOverlay ?? '',
          close: classNames?.previewClose ?? '',
        }}
        className={cn('w-full max-w-3xl', classNames?.previewContent)}
      >
        <DialogTitle className={classNames?.previewTitle}>{file.name}</DialogTitle>
        <DialogDescription className={classNames?.previewDescription}>
          {file.type || t('upload.file')} ·{' '}
          {new Intl.NumberFormat(locale.code).format(
            Math.max(1, Math.round(file.size / 1024)),
          )}{' '}
          KB
        </DialogDescription>
        <div
          className={cn(
            'mt-4 max-h-[60vh] overflow-auto rounded-control border border-line bg-canvas p-3',
            classNames?.previewBody,
          )}
        >
          {image && url && !failed ? (
            <UiImage
              src={url}
              alt={file.name}
              className={cn(
                'mx-auto max-h-[55vh] max-w-full object-contain',
                classNames?.previewImage,
              )}
              onError={() => setFailed(true)}
            />
          ) : text && content !== undefined ? (
            <pre
              className={cn(
                'whitespace-pre-wrap break-words text-ui-sm text-ink',
                classNames?.previewText,
              )}
            >
              {content}
            </pre>
          ) : (
            <p className="text-control text-muted">
              {failed
                ? t('upload.failed')
                : text && file.size <= 1024 * 1024
                  ? t('upload.reading')
                  : t('upload.noPreview')}
            </p>
          )}
        </div>
        {url && (
          <UiLink
            data-testid={partTestId(testId, 'download')}
            href={url}
            download={file.name}
            className={cn(
              'mt-4 inline-flex text-control font-medium text-brand-700 underline underline-offset-4',
              classNames?.download,
            )}
          >
            {t('upload.download')}
          </UiLink>
        )}
      </DialogContent>
    </Dialog>
  );
}
