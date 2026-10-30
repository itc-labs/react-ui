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
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { menuItemClass } from '../dropdown-menu/classes';

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
  | 'menu'
  | 'menuItem'
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
    /** First N options stay inline, plus the selected one; the rest open from a "+N" menu. */
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
  const controls = useRef(new Map<string, HTMLButtonElement>());
  const picked = useRef<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const selected = value !== undefined ? value : internalValue;
  const selectedOption = options.find((option) => option.value === selected);
  const limit =
    maxVisible !== undefined && Number.isFinite(maxVisible)
      ? Math.max(1, Math.floor(maxVisible))
      : options.length;
  const visible = options.filter(
    (option, index) => index < limit || option.value === selected,
  );
  const hidden = options.filter((option) => !visible.includes(option));
  const hiddenCount = hidden.length;
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
          <Popover open={menuOpen && !disabled} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild disabled={disabled}>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-label={t('optionGroup.expand', { count: hiddenCount })}
                data-testid={partTestId(testId, 'expand')}
                className={cn(
                  'cursor-pointer rounded-full border border-dashed border-control-border bg-surface text-ink hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-solid data-[state=open]:border-accent',
                  controlSizes[size],
                  focusRingClassName,
                  classNames?.expand,
                )}
              >
                {t('optionGroup.more', { count: hiddenCount })}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              onOpenAutoFocus={(event) => {
                event.preventDefault();
                (event.currentTarget as HTMLElement)
                  .querySelector<HTMLElement>(
                    '[role="option"]:not([aria-disabled="true"])',
                  )
                  ?.focus();
              }}
              onCloseAutoFocus={(event) => {
                const next = picked.current;
                picked.current = null;
                if (!next) return;
                // The picked option renders inline after this close; focus it there.
                event.preventDefault();

                requestAnimationFrame(() => controls.current.get(next)?.focus());
              }}
              className={cn('w-auto min-w-40 p-1', classNames?.menu)}
            >
              <div
                role="listbox"
                aria-label={t('optionGroup.expand', { count: hiddenCount })}
                data-testid={partTestId(testId, 'menu')}
                className="grid max-h-72 overflow-y-auto"
                onKeyDown={(event) => {
                  const items = Array.from(
                    event.currentTarget.querySelectorAll<HTMLElement>(
                      '[role="option"]:not([aria-disabled="true"])',
                    ),
                  );
                  const index = items.indexOf(document.activeElement as HTMLElement);
                  const target =
                    event.key === 'ArrowDown'
                      ? items[(index + 1) % items.length]
                      : event.key === 'ArrowUp'
                        ? items[(index - 1 + items.length) % items.length]
                        : event.key === 'Home'
                          ? items[0]
                          : event.key === 'End'
                            ? items.at(-1)
                            : undefined;
                  if (!target) return;
                  event.preventDefault();
                  target.focus();
                }}
              >
                {hidden.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={false}
                    aria-disabled={option.disabled || undefined}
                    tabIndex={-1}
                    data-testid={partTestId(testId, 'menuItem', option.value)}
                    className={cn(
                      'relative w-full cursor-pointer gap-2 text-left focus:bg-hover focus:outline-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
                      menuItemClass,
                      classNames?.menuItem,
                    )}
                    onClick={() => {
                      if (option.disabled) return;
                      picked.current = option.value;
                      choose(option);
                      setMenuOpen(false);
                    }}
                  >
                    {variant === 'swatch' && (
                      <span
                        aria-hidden="true"
                        className="size-5 shrink-0 overflow-hidden rounded-full bg-canvas ring-1 ring-control-border"
                        style={{ backgroundColor: option.color }}
                      >
                        {option.image && (
                          <UiImage
                            src={option.image}
                            alt=""
                            className="size-full object-cover"
                          />
                        )}
                      </span>
                    )}
                    <span className={cn(option.disabled && 'line-through')}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
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
