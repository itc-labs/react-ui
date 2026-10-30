'use client';

import { KitIcon } from '../../components/icon/kit-icon';
import { KitIconButton } from '../../components/icon-button/kit-icon-button';
import { UploadIcon } from '../../components/icon/outline/upload';
import { UploadIcon as UploadBoldIcon } from '../../components/icon/bold/upload';
import { CloseIcon } from '../../components/icon/outline/close';
import { CloseIcon as CloseBoldIcon } from '../../components/icon/bold/close';
import { partTestId } from '../../components/common/testing';

import { useUILocale } from '../../i18n/provider';
import { useId, useRef, useState } from 'react';
import { Avatar } from '../../components/avatar';
import { cn, fieldDescription } from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import { useObjectUrl } from '../../components/common/use-object-url';
import { useComposedRefs } from '../../components/common/refs';
import {
  getFileIssue,
  type FileValidationIssue,
} from '../../components/upload-field/validation';
import { AvatarCropDialog } from './crop-dialog';
export type { AvatarUploadProps } from './types';
import type { AvatarUploadProps } from './types';

export function AvatarUpload({
  'data-testid': testId,
  value,
  defaultValue = null,
  onValueChange,
  uploadable = true,
  crop = true,
  disabled,
  required,
  label,
  error,
  hint,
  maxBytes = 2 * 1024 * 1024,
  name,
  onBlur,
  ref,
  src,
  className,
  classNames,
  ...avatar
}: AvatarUploadProps & { 'data-testid'?: string | undefined }) {
  const { t } = useUILocale();
  label ??= t('avatar.label');
  hint ??= t('avatar.hint', { size: Math.round((maxBytes / 1024 / 1024) * 10) / 10 });
  const [pending, setPending] = useState<File | null>(null);
  const [local, setLocal] = useState<File | null>(defaultValue),
    [rejected, setRejected] = useState<FileValidationIssue>();
  const file = value === undefined ? local : value,
    preview = useObjectUrl(file);
  const id = useId(),
    input = useRef<HTMLInputElement>(null),
    button = useRef<HTMLButtonElement>(null),
    composedRef = useComposedRefs(button, ref);
  const issue = error || (rejected ? t(rejected.key, rejected.values) : undefined),
    blocked = Boolean(disabled || avatar.loading);

  function change(next: File | null) {
    setRejected(undefined);
    setLocal(next);
    onValueChange?.(next);
    onBlur?.();
  }

  return (
    <div
      data-testid={testId}
      className={cn(
        'grid w-full min-w-0 max-w-xs grid-cols-1 content-start justify-items-center justify-self-center gap-3 text-center',
        classNames?.root,
        className,
      )}
    >
      {uploadable && (
        <label
          data-testid={partTestId(testId, 'label')}
          htmlFor={id}
          className={cn(
            'w-full min-w-0 break-words text-ui-sm font-medium text-ink',
            classNames?.label,
          )}
        >
          {label}
          {required && (
            <span
              data-testid={partTestId(testId, 'required')}
              aria-hidden="true"
              className={cn('ml-1 text-danger-700', classNames?.required)}
            >
              *
            </span>
          )}
        </label>
      )}
      <div
        data-testid={partTestId(testId, 'avatarWrapper')}
        className={cn(
          'group relative mx-2 my-1 inline-flex shrink-0',
          classNames?.avatarWrapper,
        )}
      >
        <Avatar
          data-testid={partTestId(testId, 'avatar')}
          {...avatar}
          className={cn(avatar.size === 'lg' && 'size-24', classNames?.avatar)}
          classNames={{
            image: classNames?.image ?? '',
            fallback: classNames?.fallback ?? '',
            spinner: classNames?.spinner ?? '',
          }}
          {...(preview || src ? { src: preview ?? src } : {})}
        />
        {uploadable && (
          <button
            data-testid={partTestId(testId, 'upload')}
            ref={composedRef}
            id={id}
            type="button"
            aria-label={label}
            title={file || src ? t('avatar.change') : t('avatar.upload')}
            aria-invalid={Boolean(issue)}
            aria-busy={avatar.loading || undefined}
            aria-describedby={fieldDescription(id, Boolean(issue), Boolean(hint))}
            disabled={blocked}
            onBlur={onBlur}
            onClick={() => input.current?.click()}
            className={cn(
              avatar.shape === 'square' ? 'rounded-control' : 'rounded-full',
              'absolute inset-0 flex size-full cursor-pointer flex-col items-center justify-center gap-1 bg-brand-800/70 text-on-brand opacity-0 transition-opacity duration-[var(--motion-duration-control)] group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-0 [@media(hover:none)]:opacity-100 motion-reduce:transition-none',
              focusRingClassName,
              classNames?.upload,
            )}
            style={blocked ? { opacity: 0 } : undefined}
          >
            <KitIcon
              data-testid={partTestId(testId, 'uploadIcon')}
              name="upload"
              builtin={{ outline: UploadIcon, bold: UploadBoldIcon }}
              className={classNames?.uploadIcon}
            />
            {avatar.size === 'lg' && (
              <span
                data-testid={partTestId(testId, 'uploadText')}
                className={cn('text-eyebrow font-medium', classNames?.uploadText)}
              >
                {file || src ? t('avatar.changeShort') : t('avatar.uploadShort')}
              </span>
            )}
          </button>
        )}
        {uploadable && file && (
          <KitIconButton
            data-testid={partTestId(testId, 'remove')}
            icon="close"
            builtin={{ outline: CloseIcon, bold: CloseBoldIcon }}
            label={t('avatar.remove')}
            title={t('avatar.remove')}
            variant="secondary"
            size="sm"
            disabled={blocked}
            className={cn(
              avatar.shape === 'square' ? '-right-2 -top-2' : 'right-0 top-0',
              avatar.size === 'sm'
                ? 'size-4'
                : avatar.size === 'lg'
                  ? 'size-6'
                  : 'size-5',
              'absolute z-10 rounded-full border border-line bg-surface p-0 text-muted shadow-panel before:absolute before:-inset-1 before:rounded-full hover:border-danger-700/20 hover:bg-danger-50 hover:text-danger-700 focus-visible:outline-offset-2',
              focusRingClassName,
              classNames?.remove,
            )}
            iconClassName={cn(
              avatar.size === 'sm'
                ? 'size-2.5'
                : avatar.size === 'lg'
                  ? 'size-3.5'
                  : 'size-3',
              classNames?.removeIcon,
            )}
            onClick={() => {
              change(null);
              button.current?.focus();
            }}
          />
        )}
      </div>
      {pending && uploadable && (
        <AvatarCropDialog
          data-testid={partTestId(testId, 'crop')}
          file={pending}
          shape={avatar.shape}
          maxBytes={maxBytes}
          disabled={blocked}
          classNames={classNames}
          onCancel={() => {
            setPending(null);
            button.current?.focus();
          }}
          onApply={(next) => {
            setPending(null);
            change(next);
            button.current?.focus();
          }}
        />
      )}
      {uploadable && (
        <>
          <input
            data-testid={partTestId(testId, 'input')}
            ref={input}
            type="file"
            name={name}
            accept="image/png,image/jpeg,image/webp"
            disabled={blocked}
            tabIndex={-1}
            className="hidden"
            aria-label={t('avatar.input', { label })}
            onChange={(event) => {
              const files = Array.from(event.currentTarget.files ?? []);
              event.currentTarget.value = '';
              if (!files.length) return;
              const problem = getFileIssue(files, {
                accept: 'image/png,image/jpeg,image/webp',
                maxBytes,
                maxFiles: 1,
              });
              if (problem) {
                setRejected(problem);
                onBlur?.();

                return;
              }
              setRejected(undefined);
              if (crop) setPending(files[0]!);
              else change(files[0]!);
            }}
          />
          {issue ? (
            <p
              data-testid={partTestId(testId, 'error')}
              id={`${id}-error`}
              role="alert"
              className={cn(
                'w-full min-w-0 whitespace-normal break-words px-2 text-ui-sm leading-5 text-danger-700',
                classNames?.error,
              )}
            >
              {issue}
            </p>
          ) : hint ? (
            <p
              data-testid={partTestId(testId, 'hint')}
              id={`${id}-hint`}
              className={cn(
                'w-full min-w-0 whitespace-normal break-words px-2 text-ui-sm leading-5 text-muted',
                classNames?.hint,
              )}
            >
              {hint}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

export { AvatarField } from './form-field';
