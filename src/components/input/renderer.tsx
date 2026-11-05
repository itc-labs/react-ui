'use client';
import { useUILocale } from '../../i18n/provider';
import { CloseIcon } from '../icon/outline/close';
import { focusRingClassName } from '../common/focus-ring';
import { interactiveTrigger } from '../common/interactive-trigger';
import type { TestIdProps } from '../common/testing';

import { partTestId } from '../common/testing';

import { useId, type ComponentProps, type ReactNode } from 'react';
import {
  type SlotClasses,
  cn,
  clearIndicatorClassName,
  controlBase,
  controlSizes,
  fieldDescription,
  type ControlSize,
} from '../common';
import type { IconGlyph, IconName } from '../icon/types';
import type { IconProps } from '../icon/props';

export type InputProps = (Omit<ComponentProps<'input'>, 'size'> & {
  'data-testid'?: string | undefined;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  size?: ControlSize;
  icon?: IconName | IconGlyph;
  iconRight?: IconName | IconGlyph;
  endAddon?: ReactNode;
  /** Show a clear action for a controlled value. Supply onClear to update host state. */
  clearable?: boolean;
  onClear?: () => void;
  clearLabel?: string;
  classNames?: SlotClasses<
    | 'root'
    | 'label'
    | 'required'
    | 'field'
    | 'control'
    | 'icon'
    | 'iconRight'
    | 'endAddon'
    | 'clear'
    | 'hint'
    | 'error'
  >;
  rootClassName?: string;
}) &
  TestIdProps;

export function InputRenderer({
  'data-testid': testId,
  id,
  label,
  hint,
  error,
  size = 'md',
  icon,
  iconRight,
  endAddon,
  clearable = false,
  onClear,
  clearLabel,
  rootClassName,
  className,
  classNames,
  required,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  renderIcon,
  ...props
}: InputProps & { renderIcon: (props: IconProps) => ReactNode } & {
  'data-testid'?: string | undefined;
}) {
  const { t } = useUILocale();
  const hasClearAction =
    clearable &&
    onClear &&
    props.value != null &&
    String(props.value).length > 0 &&
    !props.disabled &&
    !props.readOnly &&
    endAddon == null;

  const generatedId = useId();
  const controlId = id ?? generatedId;

  return (
    <div
      data-testid={partTestId(testId, 'root')}
      className={cn(
        'grid w-full content-start gap-1.5',
        classNames?.root,
        rootClassName,
      )}
    >
      {label != null && (
        <label
          data-testid={partTestId(testId, 'label')}
          htmlFor={controlId}
          className={cn('text-ui-sm font-medium text-ink', classNames?.label)}
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
        data-testid={partTestId(testId, 'field')}
        className={cn('relative flex min-w-0 items-center', classNames?.field)}
      >
        {icon &&
          renderIcon({
            'data-testid': partTestId(testId, 'icon'),
            ...(typeof icon === 'string' ? { name: icon } : { glyph: icon }),
            size: size === 'lg' ? 18 : 16,
            className: cn(
              'pointer-events-none absolute left-3 text-muted',
              classNames?.icon,
            ),
          })}
        <input
          data-testid={testId}
          {...props}
          id={controlId}
          required={required}
          aria-invalid={Boolean(error) || invalid}
          aria-describedby={fieldDescription(
            controlId,
            Boolean(error),
            Boolean(hint),
            describedBy,
          )}
          className={cn(
            controlBase,
            controlSizes[size],
            icon && 'pl-9',
            (iconRight || endAddon != null || hasClearAction) && 'pr-10',
            classNames?.control,
            className,
          )}
        />
        {endAddon != null ? (
          <span
            data-testid={partTestId(testId, 'endAddon')}
            className={cn('absolute right-1.5 flex items-center', classNames?.endAddon)}
          >
            {endAddon}
          </span>
        ) : hasClearAction ? (
          <button
            type="button"
            data-testid={partTestId(testId, 'clear')}
            aria-label={clearLabel ?? t('input.clear')}
            className={cn(
              clearIndicatorClassName,
              focusRingClassName,
              'absolute right-2 inline-flex size-5 items-center justify-center border-0',
              classNames?.clear,
            )}
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              const input = event.currentTarget.parentElement?.querySelector('input');
              onClear();
              input?.focus();
            }}
          >
            {renderIcon({ glyph: CloseIcon, size: 16 })}
          </button>
        ) : (
          iconRight &&
          renderIcon({
            'data-testid': partTestId(testId, 'iconRight'),
            ...(typeof iconRight === 'string'
              ? { name: iconRight }
              : { glyph: iconRight }),
            size: size === 'lg' ? 18 : 16,
            className: cn(
              'pointer-events-none absolute right-3 text-muted',
              classNames?.iconRight,
            ),
          })
        )}
      </div>
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

InputRenderer[interactiveTrigger] = true;
