'use client';
import { partTestId } from '../../components/common/testing';

import { useUILocale } from '../../i18n/provider';
import { useEffect, useId } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cn, fieldDescription } from '../../components/common';
export type { EditorProps } from './types';
import type { EditorProps } from './types';
import { EditorToolbar } from './toolbar';

export function Editor({
  'data-testid': testId,
  id,
  name,
  label,
  hint,
  error,
  required,
  value,
  defaultValue = '',
  onValueChange,
  onBlur,
  disabled,
  readOnly,
  className,
  classNames,
}: EditorProps & { 'data-testid'?: string | undefined }) {
  const { t } = useUILocale();
  label ??= t('editor.label');
  const generated = useId(),
    controlId = id ?? generated;
  const blocked = Boolean(disabled || readOnly);
  const editor = useEditor({
    extensions: [StarterKit.configure({ link: false, heading: { levels: [2, 3] } })],
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    content: value ?? defaultValue,
    editable: !blocked,
    editorProps: {
      attributes: {
        id: controlId,
        role: 'textbox',
        ...(testId ? { 'data-testid': partTestId(testId, 'input')! } : {}),
        'aria-multiline': 'true',
        'aria-label': label,
        'aria-required': String(Boolean(required)),
        'aria-invalid': String(Boolean(error)),
        'aria-describedby':
          fieldDescription(controlId, Boolean(error), Boolean(hint)) ?? '',
        class: cn(
          'pod-editor-content min-h-40 px-3 py-3 text-control outline-none',
          classNames?.content,
        ),
      },
    },
    onUpdate: ({ editor: current }) =>
      onValueChange?.(current.isEmpty ? '' : current.getHTML()),
  });

  useEffect(() => {
    editor?.setEditable(!blocked, false);
  }, [editor, blocked]);

  useEffect(() => {
    if (
      editor &&
      value !== undefined &&
      value !== (editor.isEmpty ? '' : editor.getHTML())
    )
      editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    editor?.setOptions({
      editorProps: {
        attributes: {
          id: controlId,
          role: 'textbox',
          ...(testId ? { 'data-testid': partTestId(testId, 'input')! } : {}),
          'aria-multiline': 'true',
          'aria-label': label,
          'aria-required': String(Boolean(required)),
          'aria-invalid': String(Boolean(error)),
          'aria-disabled': String(Boolean(disabled)),
          'aria-readonly': String(Boolean(readOnly)),
          'aria-describedby':
            fieldDescription(controlId, Boolean(error), Boolean(hint)) ?? '',
          class: cn(
            'pod-editor-content min-h-40 px-3 py-3 text-control outline-none',
            classNames?.content,
          ),
        },
      },
    });
  }, [
    editor,
    controlId,
    label,
    required,
    error,
    hint,
    disabled,
    readOnly,
    classNames?.content,
    testId,
  ]);

  return (
    <div
      data-testid={testId}
      className={cn('grid min-w-0 content-start gap-1.5', classNames?.root, className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          onBlur?.();
      }}
    >
      <label
        data-testid={partTestId(testId, 'label')}
        htmlFor={controlId}
        className={cn('text-ui-sm font-medium text-ink', classNames?.label)}
        onClick={() => editor?.commands.focus()}
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
      <div
        data-testid={partTestId(testId, 'container')}
        className={cn(
          'overflow-hidden rounded-control border border-control-border bg-surface focus-within:border-accent focus-within:shadow-control-focus',
          error &&
            'border-danger-700 focus-within:border-danger-700 focus-within:shadow-control-error',
          disabled && 'cursor-not-allowed opacity-60',
          classNames?.container,
        )}
      >
        {!readOnly && (
          <EditorToolbar
            data-testid={testId}
            editor={editor}
            disabled={disabled}
            classNames={classNames}
          />
        )}
        <EditorContent editor={editor} />
      </div>
      {name && (
        <input
          type="hidden"
          name={name}
          disabled={disabled}
          value={editor?.isEmpty ? '' : (editor?.getHTML() ?? value ?? defaultValue)}
        />
      )}
      {error ? (
        <p
          data-testid={partTestId(testId, 'error')}
          id={`${controlId}-error`}
          className={cn('text-ui-sm text-danger-700', classNames?.error)}
        >
          {error}
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

export { EditorField } from './form-field';
