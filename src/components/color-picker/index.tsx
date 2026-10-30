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
import { ColorFilterIcon } from '../icon/outline/color-filter';
import { ColorFilterIcon as ColorFilterBoldIcon } from '../icon/bold/color-filter';

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
              'flex items-center gap-2 text-left',
              readOnly && 'cursor-default',
              classNames?.control,
              className,
            )}
          >
            <span
              aria-hidden="true"
              data-testid={partTestId(testId, 'swatch')}
              style={{ backgroundColor: value || 'transparent' }}
              className={cn(
                'size-5 shrink-0 rounded border border-line',
                classNames?.swatch,
              )}
            />
            <span
              data-testid={partTestId(testId, 'value')}
              className={cn(
                'min-w-0 truncate',
                !value && 'text-muted',
                classNames?.value,
              )}
            >
              {value || placeholder || t('color.placeholder')}
            </span>
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
          className={cn('flex flex-col gap-3', classNames?.popover)}
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
                '!w-full motion-reduce:[&_*]:!transition-none',
                classNames?.picker,
              )}
            />
          </div>
          <div className="grid gap-1.5">
            <label
              data-testid={partTestId(testId, 'hex-label')}
              htmlFor={`${controlId}-hex`}
              className="text-ui-sm font-medium text-ink"
            >
              {t('color.hex')}
            </label>
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
                controlSizes[size],
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
                    'size-7 rounded-control border border-line',
                    focusRingClassName,
                    'aria-pressed:ring-2 aria-pressed:ring-accent',
                    classNames?.preset,
                  )}
                  onClick={() => change(preset)}
                />
              ))}
            </div>
          )}
          {eyeDropper && hasEyeDropper && (
            <button
              type="button"
              data-testid={partTestId(testId, 'eyeDropper')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-control border border-line p-2 text-control hover:bg-hover',
                focusRingClassName,
                classNames?.eyeDropper,
              )}
              onClick={sample}
            >
              <KitIcon
                name="colorFilter"
                builtin={{ outline: ColorFilterIcon, bold: ColorFilterBoldIcon }}
              />
              {t('color.eyeDropper')}
            </button>
          )}
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
