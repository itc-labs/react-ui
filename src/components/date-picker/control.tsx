'use client';

import { KitIcon } from '../icon/kit-icon';
import { KitIconButton } from '../icon-button/kit-icon-button';
import { CalendarIcon } from '../icon/outline/calendar';
import { CalendarIcon as CalendarBoldIcon } from '../icon/bold/calendar';
import { CloseIcon } from '../icon/outline/close';
import { CloseIcon as CloseBoldIcon } from '../icon/bold/close';
import { partTestId } from '../common/testing';

import { useUILocale } from '../../i18n/provider';
import { useRef, type ReactNode } from 'react';
import {
  cn,
  clearIndicatorClassName,
  controlBase,
  controlSizes,
  fieldDescription,
} from '../common';
import { useComposedRefs } from '../common/refs';
import { Popover, PopoverTrigger, PopoverContent } from '../popover';

export type { PickerFieldProps } from './types';
import type { PickerFieldProps } from './types';

export function PickerControl({
  'data-testid': testId,
  id,
  label,
  hint,
  error,
  required,
  disabled,
  size = 'md',
  className,
  rootClassName,
  classNames,
  ref,
  onBlur,
  'aria-label': ariaLabel,
  'aria-describedby': description,
  text,
  placeholder,
  open,
  onOpenChange,
  onClear,
  children,
}: PickerFieldProps & {
  id: string;
  text: string;
  placeholder: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClear?: (() => void) | undefined;
  children: ReactNode;
} & { 'data-testid'?: string | undefined }) {
  const { t } = useUILocale();
  const button = useRef<HTMLButtonElement>(null);
  const composedRef = useComposedRefs(button, ref);
  const opening = useRef(open);
  const interactedOutside = useRef(false);
  opening.current = open;

  function changeOpen(next: boolean) {
    if (next) interactedOutside.current = false;
    opening.current = next;
    onOpenChange(next);
    if (!next) onBlur?.();
  }

  return (
    <div
      data-testid={partTestId(testId, 'root')}
      className={cn(
        'grid min-w-0 content-start gap-1.5',
        classNames?.root,
        rootClassName,
      )}
    >
      {label != null && (
        <label
          data-testid={partTestId(testId, 'label')}
          htmlFor={id}
          className={cn('text-ui-sm font-medium text-ink', classNames?.label)}
        >
          {label}
          {required && (
            <>
              <span
                data-testid={partTestId(testId, 'required')}
                aria-hidden="true"
                className={cn('ml-1 text-danger-700', classNames?.required)}
              >
                *
              </span>
              <span className="sr-only">{t('common.required')}</span>
            </>
          )}
        </label>
      )}
      <Popover open={open} onOpenChange={changeOpen}>
        <div
          data-testid={partTestId(testId, 'field')}
          className={cn(
            'relative flex min-w-0 items-center self-start',
            classNames?.field,
          )}
        >
          <PopoverTrigger asChild>
            <button
              data-testid={testId}
              ref={composedRef}
              type="button"
              id={id}
              disabled={disabled}
              aria-label={ariaLabel}
              aria-invalid={Boolean(error)}
              aria-describedby={fieldDescription(
                id,
                Boolean(error),
                Boolean(hint),
                description,
              )}
              onBlur={() => {
                if (!opening.current) onBlur?.();
              }}
              className={cn(
                controlBase,
                controlSizes[size],
                'flex min-w-0 items-center gap-2 text-left',
                onClear && text && 'pr-10',
                !text && 'text-muted',
                classNames?.control,
                className,
              )}
            >
              <KitIcon
                data-testid={partTestId(testId, 'icon')}
                name="calendar"
                builtin={{ outline: CalendarIcon, bold: CalendarBoldIcon }}
                className={cn('shrink-0', classNames?.icon)}
              />
              <span
                data-testid={partTestId(testId, 'value')}
                className={cn('min-w-0 flex-1 truncate', classNames?.value)}
              >
                {text || placeholder}
              </span>
            </button>
          </PopoverTrigger>
          {onClear && text && (
            <KitIconButton
              data-testid={partTestId(testId, 'clear')}
              label={t('date.clear')}
              icon="close"
              builtin={{ outline: CloseIcon, bold: CloseBoldIcon }}
              variant="ghost"
              size="sm"
              className={cn(
                clearIndicatorClassName,
                'absolute right-2 top-1/2 size-5 -translate-y-1/2 border-0',
                classNames?.clear,
              )}
              disabled={disabled}
              onClick={() => {
                onClear();
                button.current?.focus();
              }}
            />
          )}
        </div>
        <PopoverContent
          data-testid={partTestId(testId, 'popover')}
          align="start"
          collisionPadding={16}
          aria-label={
            typeof label === 'string' ? label : (ariaLabel ?? t('date.placeholder'))
          }
          onOpenAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={() => {
            interactedOutside.current = true;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (!interactedOutside.current) button.current?.focus();
          }}
          className={cn(
            'flex w-auto max-w-[calc(100vw-2rem)] flex-col gap-3 p-3',
            classNames?.popover,
          )}
        >
          {children}
        </PopoverContent>
      </Popover>
      {error ? (
        <p
          data-testid={partTestId(testId, 'error')}
          id={`${id}-error`}
          className={cn('text-ui-sm text-danger-700', classNames?.error)}
        >
          {error}
        </p>
      ) : hint ? (
        <p
          data-testid={partTestId(testId, 'hint')}
          id={`${id}-hint`}
          className={cn('text-ui-sm text-muted', classNames?.hint)}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
