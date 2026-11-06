'use client';
import { KitIcon } from '../icon/kit-icon';

import { Fragment, type ReactNode, type Ref } from 'react';
import { DropdownMenu as Primitive, RadioGroup as Segments } from 'radix-ui';
import { focusRingClassName } from '../common/focus-ring';
import { controlSizes } from '../common';
import { Button, type ButtonProps } from '../button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import { menuItemClass } from '../dropdown-menu/classes';
import { cn, partTestId, type SlotClasses, type TestIdProps } from '../common';
import { useUILocale } from '../../i18n/provider';
import { ChevronDownIcon } from '../icon/outline/chevron-down';
import { ChevronDownIcon as ChevronDownBoldIcon } from '../icon/bold/chevron-down';
import { CheckIcon } from '../icon/outline/check';
import { CheckIcon as CheckBoldIcon } from '../icon/bold/check';

export type LanguageOption = {
  value: string;
  label: string;
  /** Compact segmented label; defaults to the language subtag, e.g. en or vi. */
  shortLabel?: string;
  /** A host-selected region flag or image; languages do not imply a country. */
  flag: ReactNode;
  disabled?: boolean;
};

export type LanguageSwitcherProps = TestIdProps & {
  options: readonly LanguageOption[];
  value: string;
  onValueChange: (value: string) => void;
  /** auto shows two segmented options, otherwise a radio menu. */
  mode?: 'auto' | 'segmented' | 'toggle' | 'dropdown';
  disabled?: boolean;
  label?: string;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  className?: string;
  classNames?: SlotClasses<
    | 'root'
    | 'trigger'
    | 'flag'
    | 'label'
    | 'content'
    | 'item'
    | 'indicator'
    | 'segment'
    | 'selectedSegment'
  >;
  ref?: Ref<HTMLButtonElement>;
};

export function LanguageSwitcher({
  options,
  value,
  onValueChange,
  mode = 'auto',
  disabled,
  label,
  size = 'sm',
  variant = 'secondary',
  className,
  classNames,
  ref,
  'data-testid': testId,
}: LanguageSwitcherProps) {
  const { t } = useUILocale();
  const selected = options.find((option) => option.value === value);
  const available = options.filter((option) => !option.disabled);
  const index = available.findIndex((option) => option.value === value);
  const next = available[(index + 1) % available.length];
  const toggle = mode === 'toggle';
  const segmented = mode === 'segmented' || (mode === 'auto' && options.length === 2);
  const blocked =
    disabled || !available.length || (toggle && (!next || next.value === value));

  const content = (option: LanguageOption | undefined) => (
    <>
      <span
        aria-hidden="true"
        className={cn('inline-flex shrink-0 items-center text-body', classNames?.flag)}
      >
        {option?.flag}
      </span>
      <span className={classNames?.label} lang={option?.value}>
        {option?.label ?? label ?? t('language.label')}
      </span>
    </>
  );

  if (segmented)
    return (
      <Segments.Root
        data-testid={testId}
        aria-label={label ?? t('language.label')}
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue !== value) onValueChange(nextValue);
        }}
        orientation="horizontal"
        disabled={disabled}
        className={cn(
          'inline-flex w-fit max-w-full items-center gap-0.5 rounded-control',
          classNames?.root,
          className,
        )}
      >
        {options.map((option, index) => (
          <Fragment key={option.value}>
            {index > 0 && (
              <span aria-hidden="true" className="select-none text-line">
                |
              </span>
            )}
            <Segments.Item
              ref={
                option.value === (selected?.value ?? available[0]?.value)
                  ? ref
                  : undefined
              }
              key={option.value}
              value={option.value}
              aria-label={option.label}
              title={option.label}
              disabled={option.disabled}
              data-testid={partTestId(testId, 'option', option.value)}
              className={cn(
                'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control font-semibold text-muted transition-colors hover:bg-hover hover:text-ink data-[state=checked]:bg-surface data-[state=checked]:text-ink data-[state=checked]:shadow-panel focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                controlSizes[size ?? 'sm'],
                focusRingClassName,
                classNames?.segment,
                option.value === value && classNames?.selectedSegment,
              )}
            >
              <span lang={option.value} className={classNames?.label}>
                {option.shortLabel ?? option.value.split('-')[0]}
              </span>
            </Segments.Item>
          </Fragment>
        ))}
      </Segments.Root>
    );

  const trigger = (
    <Button
      ref={ref}
      data-testid={testId}
      variant={variant}
      size={size}
      disabled={blocked}
      className={cn(classNames?.trigger, className)}
      aria-label={
        label ??
        (toggle && next
          ? t('language.switchTo', { language: next.label })
          : t('language.label'))
      }
      onClick={toggle && next ? () => onValueChange(next.value) : undefined}
    >
      {content(selected)}
      {!toggle && (
        <KitIcon
          name="chevronDown"
          builtin={{ outline: ChevronDownIcon, bold: ChevronDownBoldIcon }}
          className="size-4"
        />
      )}
    </Button>
  );
  if (toggle) return trigger;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        aria-label={label ?? t('language.label')}
        data-testid={partTestId(testId, 'content')}
        className={classNames?.content}
      >
        <Primitive.RadioGroup
          value={value}
          onValueChange={(nextValue) => {
            if (
              nextValue !== value &&
              options.some((option) => option.value === nextValue && !option.disabled)
            )
              onValueChange(nextValue);
          }}
        >
          {options.map((option) => (
            <Primitive.RadioItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              textValue={option.label}
              data-testid={partTestId(testId, 'option', option.value)}
              className={cn(menuItemClass, classNames?.item)}
            >
              {content(option)}
              <Primitive.ItemIndicator className={cn('ml-auto', classNames?.indicator)}>
                <KitIcon
                  name="check"
                  builtin={{ outline: CheckIcon, bold: CheckBoldIcon }}
                  className="size-4"
                />
              </Primitive.ItemIndicator>
            </Primitive.RadioItem>
          ))}
        </Primitive.RadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
