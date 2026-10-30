'use client';

import { useId, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { useUILocale } from '../../i18n/provider';
import {
  cn,
  controlSizes,
  fieldDescription,
  partTestId,
  type SlotClasses,
  type TestIdProps,
} from '../common';
import { valueControl } from '../common/form-control';
import { focusRingClassName } from '../common/focus-ring';
import { KitIcon } from '../icon/kit-icon';
import { HelpIcon } from '../icon/outline/help';
import { HelpIcon as HelpBoldIcon } from '../icon/bold/help';
import { Tooltip } from '../tooltip';
import { UiImage } from '../link-image-provider';

export type OptionGroupOption = {
  value: string;
  label: string;
  color?: string;
  image?: string;
  disabled?: boolean;
  description?: ReactNode;
};
export type OptionGroupClassNames = SlotClasses<
  | 'root'
  | 'label'
  | 'labelHint'
  | 'required'
  | 'group'
  | 'option'
  | 'selectedOption'
  | 'optionLabel'
  | 'description'
  | 'swatch'
  | 'image'
  | 'unavailable'
  | 'expand'
  | 'hint'
  | 'error'
>;
export type OptionGroupProps = Omit<
  ComponentProps<'div'>,
  'children' | 'defaultValue' | 'onChange' | 'role' | 'tabIndex'
> &
  TestIdProps & {
    options: readonly OptionGroupOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    hint?: string;
    label?: string;
    labelHint?: ReactNode;
    showSelectedLabel?: boolean;
    layout?: 'inline' | 'stacked';
    size?: 'sm' | 'md' | 'lg';
    variant?: 'chip' | 'swatch';
    /** First N options remain visible, plus any selected option outside that range. */
    maxVisible?: number;
    classNames?: OptionGroupClassNames;
  };
const helpBuiltin = { outline: HelpIcon, bold: HelpBoldIcon };
const swatchSizes = {
  sm: 'size-control-sm',
  md: 'size-control-md',
  lg: 'size-control-lg',
};

export function OptionGroup({
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled = false,
  required = false,
  error,
  hint,
  label,
  labelHint,
  showSelectedLabel = false,
  layout = 'stacked',
  size = 'md',
  variant = 'chip',
  maxVisible,
  className,
  classNames,
  'data-testid': testId,
  'aria-describedby': describedBy,
  'aria-labelledby': labelledBy,
  ...props
}: OptionGroupProps) {
  const id = useId();
  const { t } = useUILocale();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [expanded, setExpanded] = useState(false);
  const controls = useRef(new Map<string, HTMLButtonElement>());
  const selected = value !== undefined ? value : internalValue;
  const selectedOption = options.find((option) => option.value === selected);
  const limit =
    maxVisible !== undefined && Number.isFinite(maxVisible)
      ? Math.max(1, Math.floor(maxVisible))
      : options.length;
  const visible = options.filter(
    (option, index) => expanded || index < limit || option.value === selected,
  );
  const hiddenCount = options.length - visible.length;
  const enabled = visible.filter((option) => !option.disabled && !disabled);
  const tabValue =
    enabled.find((option) => option.value === selected)?.value ?? enabled[0]?.value;

  const choose = (option: OptionGroupOption) => {
    if (disabled || option.disabled || option.value === selected) return;
    if (value === undefined) setInternalValue(option.value);
    onValueChange?.(option.value);
  };

  return (
    <div
      data-testid={partTestId(testId, 'root')}
      className={cn(
        'grid content-start gap-2',
        layout === 'inline' && label && 'grid-cols-[auto_1fr] items-center gap-x-4',
        classNames?.root,
      )}
    >
      {label && (
        <div className="flex items-center gap-1">
          <span
            id={`${id}-label`}
            data-testid={partTestId(testId, 'label')}
            className={cn('text-ui-sm font-medium text-ink', classNames?.label)}
          >
            {showSelectedLabel && selectedOption
              ? t('optionGroup.selectedLabel', {
                  label,
                  selected: selectedOption.label,
                })
              : label}
            {required && (
              <span
                aria-hidden="true"
                data-testid={partTestId(testId, 'required')}
                className={cn('ml-1 text-danger-700', classNames?.required)}
              >
                *
              </span>
            )}
          </span>
          {labelHint != null && (
            <Tooltip content={labelHint}>
              <button
                type="button"
                aria-label={t('optionGroup.help', { label })}
                data-testid={partTestId(testId, 'labelHint')}
                className={cn(
                  'inline-flex rounded-full text-muted',
                  focusRingClassName,
                  classNames?.labelHint,
                )}
              >
                <KitIcon name="help" builtin={helpBuiltin} size={16} />
              </button>
            </Tooltip>
          )}
        </div>
      )}
      <div
        {...props}
        role="radiogroup"
        aria-labelledby={labelledBy ?? (label ? `${id}-label` : undefined)}
        aria-describedby={fieldDescription(
          id,
          Boolean(error),
          Boolean(hint),
          describedBy,
        )}
        aria-invalid={Boolean(error)}
        aria-required={required}
        aria-disabled={disabled}
        data-testid={testId}
        className={cn(
          'flex flex-wrap items-center gap-2',
          classNames?.group,
          className,
        )}
      >
        {visible.map((option) => {
          const unavailable = disabled || option.disabled;
          const checked = option.value === selected;
          const control = (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-label={option.label}
              aria-checked={checked}
              aria-describedby={
                option.description != null
                  ? `${id}-description-${option.value}`
                  : undefined
              }
              disabled={unavailable}
              tabIndex={tabValue === option.value ? 0 : -1}
              ref={(node) => {
                if (node) controls.current.set(option.value, node);
                else controls.current.delete(option.value);
              }}
              data-testid={partTestId(testId, 'option', option.value)}
              onClick={() => choose(option)}
              onKeyDown={(event) => {
                if (unavailable || !enabled.length) return;
                const index = enabled.findIndex((item) => item.value === option.value);
                let next: OptionGroupOption | undefined;
                if (event.key === 'Home') next = enabled[0];
                else if (event.key === 'End') next = enabled.at(-1);
                else if (
                  ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(
                    event.key,
                  )
                ) {
                  const direction = ['ArrowRight', 'ArrowDown'].includes(event.key)
                    ? 1
                    : -1;
                  next = enabled[(index + direction + enabled.length) % enabled.length];
                } else if (event.key === ' ' || event.key === 'Enter') next = option;
                if (next) {
                  event.preventDefault();
                  controls.current.get(next.value)?.focus();
                  choose(next);
                }
              }}
              className={cn(
                'relative inline-flex shrink-0 items-center justify-center rounded-full border motion-safe:transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                focusRingClassName,
                variant === 'chip'
                  ? cn(
                      controlSizes[size],
                      checked
                        ? 'border-brand-700 bg-brand-700 text-on-brand'
                        : 'border-control-border bg-surface text-ink',
                    )
                  : cn(
                      swatchSizes[size],
                      'border-transparent bg-surface p-1',
                      checked ? 'ring-2 ring-accent' : 'ring-1 ring-control-border',
                    ),
                classNames?.option,
                checked && classNames?.selectedOption,
              )}
            >
              {variant === 'chip' ? (
                <span
                  data-testid={partTestId(testId, 'optionLabel', option.value)}
                  className={cn(unavailable && 'line-through', classNames?.optionLabel)}
                >
                  {option.label}
                </span>
              ) : (
                <>
                  <span
                    aria-hidden="true"
                    data-testid={partTestId(testId, 'swatch', option.value)}
                    className={cn(
                      'size-full overflow-hidden rounded-full bg-canvas',
                      classNames?.swatch,
                    )}
                    style={{ backgroundColor: option.color }}
                  >
                    {option.image && (
                      <UiImage
                        data-testid={partTestId(testId, 'image', option.value)}
                        src={option.image}
                        alt=""
                        className={cn('size-full object-cover', classNames?.image)}
                      />
                    )}
                  </span>
                  {unavailable && (
                    <span
                      aria-hidden="true"
                      data-testid={partTestId(testId, 'unavailable', option.value)}
                      className={cn(
                        'pointer-events-none absolute inset-x-0 top-1/2 h-px -rotate-45 bg-ink',
                        classNames?.unavailable,
                      )}
                    />
                  )}
                </>
              )}
            </button>
          );

          return (
            <div key={option.value} className="grid justify-items-center gap-1">
              {variant === 'swatch' ? (
                <Tooltip content={option.label}>{control}</Tooltip>
              ) : (
                control
              )}
              {option.description != null && (
                <div
                  id={`${id}-description-${option.value}`}
                  data-testid={partTestId(testId, 'description', option.value)}
                  className={cn('text-ui-sm text-muted', classNames?.description)}
                >
                  {option.description}
                </div>
              )}
            </div>
          );
        })}
        {hiddenCount > 0 && (
          <button
            type="button"
            disabled={disabled}
            aria-expanded={false}
            aria-label={t('optionGroup.expand', { count: hiddenCount })}
            data-testid={partTestId(testId, 'expand')}
            className={cn(
              'rounded-full border border-dashed border-control-border bg-surface text-ink disabled:opacity-50',
              controlSizes[size],
              focusRingClassName,
              classNames?.expand,
            )}
            onClick={() => {
              setExpanded(true);
              const firstHidden = options.find(
                (option, index) =>
                  index >= limit && option.value !== selected && !option.disabled,
              );
              if (firstHidden)
                requestAnimationFrame(() =>
                  controls.current.get(firstHidden.value)?.focus(),
                );
            }}
          >
            {t('optionGroup.more', { count: hiddenCount })}
          </button>
        )}
      </div>
      {name && (
        <input type="hidden" name={name} value={selected ?? ''} disabled={disabled} />
      )}
      {(error || hint) && (
        <p
          id={`${id}-${error ? 'error' : 'hint'}`}
          data-testid={partTestId(testId, error ? 'error' : 'hint')}
          className={cn(
            'text-ui-sm',
            layout === 'inline' && 'col-span-full',
            error ? 'text-danger-700' : 'text-muted',
            error ? classNames?.error : classNames?.hint,
          )}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}

OptionGroup[valueControl] = true;
