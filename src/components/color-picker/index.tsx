'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { HexAlphaColorPicker, HexColorPicker } from 'react-colorful';
import { useUILocale } from '../../i18n/provider';
import {
  cn,
  controlBase,
  controlSizes,
  fieldDescription,
  type ControlSize,
  type SlotClasses,
} from '../common';
import { focusRingClassName } from '../common/focus-ring';
import { valueControl } from '../common/form-control';
import { partTestId, type TestIdProps } from '../common/testing';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { useComposedRefs } from '../common/refs';
import { KitIcon } from '../icon/kit-icon';
import { ChevronDownIcon } from '../icon/outline/chevron-down';
import { ChevronDownIcon as ChevronDownBoldIcon } from '../icon/bold/chevron-down';
import { EyedropperIcon } from '../icon/outline/eyedropper';
import { EyedropperIcon as EyedropperBoldIcon } from '../icon/bold/eyedropper';

export type ColorPickerProps = Omit<
  ComponentProps<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'size' | 'name'
> &
  TestIdProps & {
    value?: string;
    defaultValue?: string;
    onValueChange?: (hex: string) => void;
    alpha?: boolean;
    presets?: string[];
    eyeDropper?: boolean;
    readOnly?: boolean;
    required?: boolean;
    size?: ControlSize;
    label?: ReactNode;
    placeholder?: string;
    error?: ReactNode;
    hint?: ReactNode;
    name?: string;
    classNames?: SlotClasses<
      | 'root'
      | 'label'
      | 'control'
      | 'swatch'
      | 'value'
      | 'popover'
      | 'picker'
      | 'hex'
      | 'presets'
      | 'preset'
      | 'eyeDropper'
      | 'hint'
      | 'error'
    >;
  };

function normalize(hex: string, alpha: boolean): string | undefined {
  if (!/^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i.test(hex)) return;
  let digits = hex.slice(1).toLowerCase();
  if (digits.length === 8 && !alpha) return;
  if (digits.length === 3) digits = [...digits].map((digit) => digit + digit).join('');

  return `#${alpha ? digits.padEnd(8, 'f') : digits}`;
}

// Checkerboard behind swatches so empty and translucent colors stay visible.
const checkerboard = {
  backgroundImage: 'conic-gradient(#d4d4d4 0 25%, #fff 0 50%, #d4d4d4 0 75%, #fff 0)',
  backgroundSize: '8px 8px',
};

function Swatch({
  color,
  className,
  ...props
}: ComponentProps<'span'> & { color: string }) {
  return (
    <span
      aria-hidden="true"
      {...props}
      style={checkerboard}
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]',
        className,
      )}
    >
      <span
        className="absolute inset-0 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]"
        style={{ backgroundColor: color || 'transparent' }}
      />
    </span>
  );
}

// react-colorful ships fixed sizes; reshape it into a rounded area with slim sliders.
// Source and runtime text must match for Tailwind, so the escaped underscores use String.raw.
const pickerClassName = String.raw`!h-auto !w-full gap-3
  [&_.react-colorful\_\_saturation]:!h-40 [&_.react-colorful\_\_saturation]:!flex-none
  [&_.react-colorful\_\_saturation]:!rounded-lg [&_.react-colorful\_\_saturation]:!border-b-0
  [&_.react-colorful\_\_hue]:!h-3 [&_.react-colorful\_\_hue]:!flex-none [&_.react-colorful\_\_hue]:!rounded-full
  [&_.react-colorful\_\_alpha]:!h-3 [&_.react-colorful\_\_alpha]:!flex-none [&_.react-colorful\_\_alpha]:!rounded-full
  [&_.react-colorful\_\_pointer]:!size-5 [&_.react-colorful\_\_pointer]:!border-[3px]
  [&_.react-colorful\_\_pointer]:!shadow-[0_1px_4px_rgb(0_0_0/0.35)]`.replace(
  /\s+/g,
  ' ',
);

type EyeDropperWindow = Window & {
  EyeDropper?: new () => {
    open: (options: { signal: AbortSignal }) => Promise<{ sRGBHex: string }>;
  };
};

export function ColorPicker({
  value: controlled,
  defaultValue = '',
  onValueChange,
  alpha = false,
  presets = [],
  eyeDropper = true,
  disabled,
  readOnly,
  required,
  size = 'md',
  label,
  placeholder,
  error,
  hint,
  name,
  className,
  classNames,
  id,
  'data-testid': testId,
  'aria-describedby': describedBy,
  'aria-label': ariaLabel,
  onBlur,
  ref,
  ...props
}: ColorPickerProps) {
  const { t } = useUILocale();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const composedRef = useComposedRefs(triggerRef, ref);
  const generated = useId();
  const controlId = id ?? generated;
  const [local, setLocal] = useState(defaultValue);
  const value = normalize(controlled ?? local, alpha) ?? '';
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [hasEyeDropper, setHasEyeDropper] = useState(false);
  const [picker, setPicker] = useState<HTMLDivElement | null>(null);
  const request = useRef<AbortController | null>(null);
  const blocked = disabled || readOnly;
  const expanded = open && !blocked;

  useEffect(() => {
    setHasEyeDropper(typeof (window as EyeDropperWindow).EyeDropper === 'function');

    return () => request.current?.abort();
  }, []);

  useEffect(() => {
    setDraft(null);
    setInvalid(false);
  }, [value, alpha, expanded]);

  useEffect(() => {
    if (!expanded) request.current?.abort();
    if (blocked) setOpen(false);
  }, [expanded, blocked]);

  // The picker exposes no per-slider label props. Associate localized names with its public sliders.
  useEffect(() => {
    if (!expanded || !picker) return;
    const element = picker;

    function localize() {
      const sliders = element.querySelectorAll<HTMLElement>('[role="slider"]');

      sliders.forEach((slider, index) => {
        slider.setAttribute('aria-labelledby', `${controlId}-slider-${index}`);
        slider.className = cn(slider.className, focusRingClassName);
        const text = slider.getAttribute('aria-valuetext');
        const values = text?.match(/(\d+)%.*?(\d+)%/);
        if (index === 0 && values) {
          const localized = t('color.saturationValue', {
            saturation: values[1]!,
            brightness: values[2]!,
          });
          if (text !== localized) slider.setAttribute('aria-valuetext', localized);
        }
      });
    }

    localize();
    const observer = new MutationObserver(localize);
    observer.observe(element, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-valuetext'],
    });

    return () => observer.disconnect();
  }, [expanded, alpha, controlId, t, picker]);

  function change(hex: string) {
    const next = normalize(hex, alpha);
    if (blocked || !next) return;
    if (controlled === undefined) setLocal(next);
    setDraft(null);
    setInvalid(false);
    if (next !== value) onValueChange?.(next);
  }

  function commit() {
    if (draft === null) return;
    if (normalize(draft, alpha)) change(draft);
    else setInvalid(true);
  }

  async function sample() {
    const EyeDropper = (window as EyeDropperWindow).EyeDropper;
    if (!EyeDropper || blocked) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    try {
      const result = await new EyeDropper().open({ signal: controller.signal });
      if (!controller.signal.aborted) change(result.sRGBHex);
    } catch {
      // Cancelling the native picker leaves the current selection intact.
    }
  }

  const Picker = alpha ? HexAlphaColorPicker : HexColorPicker;

  return (
    <div
      data-testid={partTestId(testId, 'root')}
      className={cn('grid min-w-0 content-start gap-1.5', classNames?.root)}
    >
      {label != null && (
        <label
          htmlFor={controlId}
          data-testid={partTestId(testId, 'label')}
          className={cn('text-ui-sm font-medium text-ink', classNames?.label)}
        >
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-danger-700">
              *
            </span>
          )}
        </label>
      )}
      <Popover
        modal
        open={expanded}
        onOpenChange={(next) => {
          if (!blocked) setOpen(next);
        }}
      >
        <PopoverTrigger asChild>
          <button
            {...props}
            ref={composedRef}
            id={controlId}
            type="button"
            disabled={disabled}
            aria-disabled={readOnly || undefined}
            aria-required={required || undefined}
            aria-label={ariaLabel ?? (label == null ? t('color.label') : undefined)}
            aria-invalid={Boolean(error) || props['aria-invalid']}
            aria-describedby={fieldDescription(
              controlId,
              Boolean(error),
              Boolean(hint),
              describedBy,
            )}
            data-testid={testId}
            onBlur={onBlur}
            className={cn(
              controlBase,
              controlSizes[size],
              focusRingClassName,
              'group/color flex items-center gap-2.5 text-left',
              readOnly && 'cursor-default',
              classNames?.control,
              className,
            )}
          >
            <Swatch
              color={value}
              data-testid={partTestId(testId, 'swatch')}
              className={cn('size-6', classNames?.swatch)}
            />
            <span
              data-testid={partTestId(testId, 'value')}
              className={cn(
                'min-w-0 flex-1 truncate',
                value ? 'font-mono text-ui-sm uppercase' : 'text-muted',
                classNames?.value,
              )}
            >
              {value || placeholder || t('color.placeholder')}
            </span>
            {!readOnly && (
              <KitIcon
                name="chevronDown"
                builtin={{ outline: ChevronDownIcon, bold: ChevronDownBoldIcon }}
                size={16}
                className="shrink-0 text-muted motion-safe:transition-transform group-aria-expanded/color:rotate-180"
              />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
          align="start"
          aria-label={t('color.label')}
          data-testid={partTestId(testId, 'popover')}
          className={cn('flex w-64 flex-col gap-3 p-3', classNames?.popover)}
        >
          <div ref={setPicker}>
            {[t('color.saturation'), t('color.hue'), t('color.alpha')].map(
              (text, index) => (
                <span
                  key={index}
                  id={`${controlId}-slider-${index}`}
                  className="sr-only"
                >
                  {text}
                </span>
              ),
            )}
            <Picker
              color={value || (alpha ? '#000000ff' : '#000000')}
              onChange={change}
              data-testid={partTestId(testId, 'picker')}
              className={cn(
                pickerClassName,
                'motion-reduce:[&_*]:!transition-none',
                classNames?.picker,
              )}
            />
          </div>
          {presets.length > 0 && (
            <div
              role="group"
              aria-label={t('color.presets')}
              data-testid={partTestId(testId, 'presets')}
              className={cn('flex flex-wrap gap-2', classNames?.presets)}
            >
              {[
                ...new Set(
                  presets
                    .map((preset) => normalize(preset, alpha))
                    .filter((preset): preset is string => Boolean(preset)),
                ),
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  aria-label={t('color.select', { color: preset })}
                  aria-pressed={value === preset}
                  data-testid={partTestId(testId, `preset-${preset.slice(1)}`)}
                  style={{ backgroundColor: preset }}
                  className={cn(
                    'size-6 cursor-pointer rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)] ring-offset-2 ring-offset-surface motion-safe:transition-transform hover:scale-110',
                    focusRingClassName,
                    'aria-pressed:ring-2 aria-pressed:ring-ink',
                    classNames?.preset,
                  )}
                  onClick={() => change(preset)}
                />
              ))}
            </div>
          )}
          <div className="grid gap-1.5">
            <label
              data-testid={partTestId(testId, 'hex-label')}
              htmlFor={`${controlId}-hex`}
              className="sr-only"
            >
              {t('color.hex')}
            </label>
            <div className="flex items-center gap-2">
              <Swatch color={value} className="size-control-sm" />
              <input
                id={`${controlId}-hex`}
                value={draft ?? value}
                placeholder={t(
                  alpha ? 'color.hexAlphaPlaceholder' : 'color.hexPlaceholder',
                )}
                autoComplete="off"
                spellCheck={false}
                data-testid={partTestId(testId, 'hex')}
                className={cn(
                  controlBase,
                  controlSizes.sm,
                  'min-w-0 flex-1 font-mono uppercase placeholder:normal-case',
                  focusRingClassName,
                  classNames?.hex,
                )}
                aria-invalid={invalid}
                aria-describedby={invalid ? `${controlId}-hex-error` : undefined}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setInvalid(false);
                }}
                onBlur={commit}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    commit();
                  }
                }}
              />
              {eyeDropper && hasEyeDropper && (
                <button
                  type="button"
                  aria-label={t('color.eyeDropper')}
                  title={t('color.eyeDropper')}
                  data-testid={partTestId(testId, 'eyeDropper')}
                  className={cn(
                    'grid size-control-sm shrink-0 cursor-pointer place-items-center rounded-control border border-control-border text-ink hover:bg-hover',
                    focusRingClassName,
                    classNames?.eyeDropper,
                  )}
                  onClick={sample}
                >
                  <KitIcon
                    name="eyedropper"
                    builtin={{ outline: EyedropperIcon, bold: EyedropperBoldIcon }}
                    size={16}
                  />
                </button>
              )}
            </div>
            {invalid && (
              <p
                data-testid={partTestId(testId, 'hex-error')}
                id={`${controlId}-hex-error`}
                role="alert"
                className="text-ui-sm text-danger-700"
              >
                {t('color.invalid')}
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {error ? (
        <p
          id={`${controlId}-error`}
          data-testid={partTestId(testId, 'error')}
          className={cn('text-ui-sm text-danger-700', classNames?.error)}
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${controlId}-hint`}
          data-testid={partTestId(testId, 'hint')}
          className={cn('text-ui-sm text-muted', classNames?.hint)}
        >
          {hint}
        </p>
      ) : null}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value}
          disabled={disabled}
          data-testid={partTestId(testId, 'hidden')}
        />
      )}
    </div>
  );
}

ColorPicker[valueControl] = true;
