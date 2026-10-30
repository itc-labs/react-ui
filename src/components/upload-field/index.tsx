'use client';

import { KitIcon } from '../icon/kit-icon';
import { UploadIcon } from '../icon/outline/upload';
import { UploadIcon as UploadBoldIcon } from '../icon/bold/upload';
import { valueControl } from '../common/form-control';
import { partTestId } from '../common/testing';

import { useUILocale } from '../../i18n/provider';
import { useId, useRef, useState } from 'react';
import { cn, fieldDescription } from '../common';
import { useComposedRefs } from '../common/refs';
import { Button } from '../button';
import { getFileIssue, type FileValidationIssue } from './validation';
export type { UploadFieldProps } from './types';
import type { UploadFieldProps } from './types';
import { UploadFileList } from './file-list';

export function UploadField({
  'data-testid': testId,
  id,
  name,
  label,
  hint,
  error,
  required,
  value,
  defaultValue = [],
  onValueChange,
  onReject,
  onBlur,
  disabled = false,
  loading = false,
  progress,
  multiple = false,
  accept,
  maxBytes = 10 * 1024 * 1024,
  maxFiles = multiple ? 5 : 1,
  className,
  classNames,
  ref,
}: UploadFieldProps & { 'data-testid'?: string | undefined }) {
  const { t } = useUILocale();
  const generated = useId(),
    controlId = id ?? generated;
  const input = useRef<HTMLInputElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const composedRef = useComposedRefs(trigger, ref);
  const [local, setLocal] = useState<readonly File[]>(defaultValue),
    [rejected, setRejected] = useState<FileValidationIssue>(),
    [dragging, setDragging] = useState(false);
  const files = value ?? local,
    issue = error || (rejected ? t(rejected.key, rejected.values) : undefined),
    blocked = disabled || loading;

  function change(next: File[]) {
    setRejected(undefined);
    setLocal(next);
    onValueChange?.(next);
    onBlur?.();
  }

  function pick(next: File[]) {
    if (blocked || !next.length) return;
    const problem = getFileIssue(next, {
      accept: accept ?? '',
      maxBytes,
      maxFiles: multiple ? maxFiles : 1,
    });
    if (problem) {
      setRejected(problem);
      onReject?.(t(problem.key, problem.values));
      onBlur?.();

      return;
    }
    change(next);
  }

  return (
    <div
      data-testid={testId}
      className={cn('grid min-w-0 content-start gap-2', classNames?.root, className)}
    >
      <label
        data-testid={partTestId(testId, 'label')}
        htmlFor={controlId}
        className={cn('text-ui-sm font-medium text-ink', classNames?.label)}
      >
        {label ?? t('upload.label')}
        {required && (
          <span
            data-testid={partTestId(testId, 'required')}
            className={cn('ml-1 text-danger-700', classNames?.required)}
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>
      <div
        data-testid={partTestId(testId, 'dropzone')}
        onDragOver={(event) => {
          event.preventDefault();
          if (!blocked) setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          pick(Array.from(event.dataTransfer.files));
        }}
        className={cn(
          'grid gap-3 rounded-control border border-dashed border-control-border bg-surface p-4',
          dragging && 'border-accent bg-hover',
          blocked && 'cursor-not-allowed opacity-60',
          issue && 'border-danger-700',
          classNames?.dropzone,
        )}
      >
        <div
          data-testid={partTestId(testId, 'actions')}
          className={cn('flex flex-wrap items-center gap-3', classNames?.actions)}
        >
          <Button
            data-testid={partTestId(testId, 'trigger')}
            className={classNames?.trigger}
            ref={composedRef}
            id={controlId}
            variant="secondary"
            loading={loading}
            disabled={disabled}
            aria-invalid={Boolean(issue)}
            aria-describedby={fieldDescription(
              controlId,
              Boolean(issue),
              Boolean(hint),
            )}
            onBlur={onBlur}
            onClick={() => input.current?.click()}
          >
            <KitIcon
              name="upload"
              builtin={{ outline: UploadIcon, bold: UploadBoldIcon }}
            />
            {t('upload.choose')}
          </Button>
          <span
            data-testid={partTestId(testId, 'dropHint')}
            className={cn('text-ui-sm text-muted', classNames?.dropHint)}
          >
            {t('upload.drop')}
          </span>
        </div>
        <input
          data-testid={partTestId(testId, 'input')}
          ref={input}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          disabled={blocked}
          tabIndex={-1}
          className="hidden"
          aria-label={label}
          onChange={(event) => {
            pick(Array.from(event.currentTarget.files ?? []));
            event.currentTarget.value = '';
          }}
        />
        {files.length > 0 && (
          <UploadFileList
            data-testid={partTestId(testId, 'files')}
            files={files}
            blocked={blocked}
            classNames={classNames}
            onRemove={(index) => {
              change(files.filter((_, i) => i !== index));
              trigger.current?.focus();
            }}
          />
        )}
        {loading && progress != null && (
          <progress
            data-testid={partTestId(testId, 'progress')}
            aria-label={t('upload.progress')}
            max={100}
            value={Math.max(0, Math.min(100, progress))}
            className={cn('w-full accent-brand-700', classNames?.progress)}
          />
        )}
      </div>
      {issue ? (
        <p
          data-testid={partTestId(testId, 'error')}
          id={`${controlId}-error`}
          role="alert"
          className={cn('text-ui-sm text-danger-700', classNames?.error)}
        >
          {issue}
        </p>
      ) : hint ? (
        <p
          data-testid={partTestId(testId, 'hint')}
          id={`${controlId}-hint`}
          className={cn('text-ui-sm text-muted', classNames?.hint)}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export type { FileRules } from './validation';
export { validateFiles } from './validation';

UploadField[valueControl] = true;
