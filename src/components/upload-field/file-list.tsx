'use client';
import { partTestId } from '../common/testing';

import { useUILocale } from '../../i18n/provider';
import { cn } from '../common';
import { IconButton } from '../icon-button';
import { FilePreview } from './file-preview';
import type { UploadFieldProps } from './types';

export function UploadFileList({
  'data-testid': testId,
  files,
  blocked,
  onRemove,
  classNames,
  className,
}: {
  files: readonly File[];
  blocked: boolean;
  onRemove: (index: number) => void;
  classNames: UploadFieldProps['classNames'];
  className?: string;
} & { 'data-testid'?: string | undefined }) {
  const { t, locale } = useUILocale();

  return (
    <ul
      data-testid={partTestId(testId, 'list')}
      className={cn('grid gap-2', classNames?.list, className)}
    >
      {files.map((file, index) => (
        <li
          data-testid={partTestId(testId, 'file', file.name, file.lastModified, index)}
          key={`${file.name}-${index}`}
          className={cn('flex min-w-0 items-center gap-2 text-ui-sm', classNames?.file)}
        >
          <FilePreview
            data-testid={partTestId(
              testId,
              'preview',
              file.name,
              file.lastModified,
              index,
            )}
            {...(classNames ? { classNames } : {})}
            file={file}
            disabled={Boolean(blocked)}
          />
          <span
            data-testid={partTestId(
              testId,
              'fileName',
              file.name,
              file.lastModified,
              index,
            )}
            className={cn('min-w-0 flex-1 break-all', classNames?.fileName)}
          >
            {file.name}{' '}
            <span
              data-testid={partTestId(
                testId,
                'fileSize',
                file.name,
                file.lastModified,
                index,
              )}
              className={cn('text-muted', classNames?.fileSize)}
            >
              (
              {new Intl.NumberFormat(locale.code).format(
                Math.max(1, Math.round(file.size / 1024)),
              )}{' '}
              KB)
            </span>
          </span>
          <IconButton
            data-testid={partTestId(
              testId,
              'remove',
              file.name,
              file.lastModified,
              index,
            )}
            className={classNames?.remove}
            label={t('upload.remove', { name: file.name })}
            icon="close"
            size="sm"
            variant="ghost"
            disabled={blocked}
            onClick={() => {
              onRemove(index);
            }}
          />
        </li>
      ))}
    </ul>
  );
}
