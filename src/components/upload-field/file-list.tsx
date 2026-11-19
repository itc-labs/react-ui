'use client';

import { useRef } from 'react';
import { UploadSort } from './upload-sort';
import { KitIconButton } from '../icon-button/kit-icon-button';
import { CloseIcon } from '../icon/outline/close';
import { CloseIcon as CloseBoldIcon } from '../icon/bold/close';
import { partTestId } from '../common/testing';

import { useUILocale } from '../../i18n/provider';
import { cn } from '../common';
import { FilePreview } from './file-preview';
import type { UploadFieldProps } from './types';

export function UploadFileList({
  'data-testid': testId,
  files,
  sortable,
  onReorder,
  blocked,
  onRemove,
  classNames,
  className,
}: {
  files: readonly File[];
  sortable: boolean;
  onReorder: (files: File[]) => void;
  blocked: boolean;
  onRemove: (index: number) => void;
  classNames: UploadFieldProps['classNames'];
  className?: string;
} & { 'data-testid'?: string | undefined }) {
  const { t, locale } = useUILocale();

  const identities = useRef(new WeakMap<File, string>());
  const nextId = useRef(0);
  const occurrences = new Map<File, number>();
  const entries = files.map((file) => {
    let id = identities.current.get(file);
    if (!id) {
      id = `file-${nextId.current++}`;
      identities.current.set(file, id);
    }

    const occurrence = occurrences.get(file) ?? 0;
    occurrences.set(file, occurrence + 1);

    return { id: occurrence ? `${id}-${occurrence}` : id, label: file.name };
  });

  return (
    <UploadSort
      enabled={sortable}
      blocked={blocked}
      orientation="vertical"
      items={entries}
      onReorder={(ids) =>
        onReorder(
          ids.map((id) => files[entries.findIndex((entry) => entry.id === id)]!),
        )
      }
    >
      <ul
        data-testid={partTestId(testId, 'list')}
        className={cn('grid gap-2', classNames?.list, className)}
      >
        {files.map((file, index) => (
          <li
            data-testid={partTestId(
              testId,
              'file',
              file.name,
              file.lastModified,
              index,
            )}
            key={entries[index]!.id}
            className={cn(
              'flex min-w-0 items-center gap-2 text-ui-sm',
              classNames?.file,
            )}
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
            <KitIconButton
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
              builtin={{ outline: CloseIcon, bold: CloseBoldIcon }}
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
    </UploadSort>
  );
}
