'use client';

import { KitIcon } from '../icon/kit-icon';
import { CloseIcon } from '../icon/outline/close';
import { CloseIcon as CloseBoldIcon } from '../icon/bold/close';
import type { ComponentProps, KeyboardEvent, MouseEvent, Ref } from 'react';
import { useUILocale } from '../../i18n/provider';
import { cn, partTestId, type SlotClasses, type TestIdProps } from '../common';
import { Icon, type IconGlyph, type IconName } from '../icon';

export type TagTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger';
export type TagSize = 'sm' | 'md';
export type TagClassNames = SlotClasses<'root' | 'icon' | 'label' | 'remove'>;
export type TagProps = Omit<ComponentProps<'span'>, 'onClick' | 'onKeyDown' | 'ref'> &
  TestIdProps & {
    ref?: Ref<HTMLSpanElement | HTMLButtonElement>;
    tone?: TagTone;
    size?: TagSize;
    icon?: IconName | IconGlyph;
    iconRight?: IconName | IconGlyph;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
    onRemove?: (
      event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLElement>,
    ) => void;
    /** Supply this for rich labels whose text cannot be inferred. */
    removeLabel?: string;
    selected?: boolean;
    disabled?: boolean;
    classNames?: TagClassNames;
  };
const tones: Record<TagTone, string> = {
  neutral: 'bg-canvas text-muted',
  brand: 'bg-brand-100 text-brand-800',
  info: 'bg-info-50 text-info-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
};
const focus =
  'outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

export function Tag({
  tone = 'neutral',
  size = 'md',
  icon,
  iconRight,
  onClick,
  onKeyDown,
  onRemove,
  removeLabel,
  selected,
  disabled = false,
  children,
  className,
  classNames,
  'data-testid': testId,
  ref,
  ...props
}: TagProps) {
  const { t } = useUILocale();
  const clickable = !!onClick || selected !== undefined;
  // A removable clickable tag has sibling action buttons, never nested buttons.
  const Root = clickable && !onRemove ? 'button' : 'span';

  const renderIcon = (value: IconName | IconGlyph, part: string) => (
    <Icon
      {...(typeof value === 'string' ? { name: value } : { glyph: value })}
      size={size === 'sm' ? 12 : 16}
      className={cn('shrink-0', classNames?.icon)}
      data-testid={partTestId(testId, part)}
    />
  );

  const content = (
    <>
      {icon && renderIcon(icon, 'icon')}
      <span className={classNames?.label} data-testid={partTestId(testId, 'label')}>
        {children}
      </span>
      {iconRight && renderIcon(iconRight, 'iconRight')}
    </>
  );
  const label =
    removeLabel ??
    t('tag.remove', {
      label:
        typeof children === 'string' || typeof children === 'number'
          ? children
          : (props['aria-label'] ?? ''),
    });

  return (
    <Root
      {...props}
      ref={ref as Ref<HTMLButtonElement>}
      data-testid={testId}
      {...(Root === 'button'
        ? { type: 'button', disabled, 'aria-pressed': selected }
        : { 'aria-disabled': disabled || undefined })}
      tabIndex={props.tabIndex ?? (onRemove && !clickable && !disabled ? 0 : undefined)}
      onClick={Root === 'button' && !disabled ? onClick : undefined}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          !event.defaultPrevented &&
          !disabled &&
          onRemove &&
          event.target === event.currentTarget &&
          (event.key === 'Backspace' || event.key === 'Delete')
        ) {
          event.preventDefault();
          onRemove(event);
        }
      }}
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-medium',
        focus,
        size === 'sm' ? 'px-2 py-0.5 text-ui-sm' : 'px-2.5 py-1 text-ui-sm',
        tones[tone],
        clickable && 'cursor-pointer',
        selected && 'ring-1 ring-current',
        disabled && 'cursor-not-allowed opacity-60',
        classNames?.root,
        className,
      )}
    >
      {clickable && onRemove ? (
        <button
          type="button"
          disabled={disabled}
          aria-pressed={selected}
          className={cn('inline-flex items-center gap-1 rounded-sm', focus)}
          onClick={onClick}
          data-testid={partTestId(testId, 'action')}
          onKeyDown={(event) => {
            if (!disabled && (event.key === 'Backspace' || event.key === 'Delete')) {
              event.stopPropagation();
              onKeyDown?.(event);
              if (!event.defaultPrevented) {
                event.preventDefault();
                onRemove(event);
              }
            }
          }}
        >
          {content}
        </button>
      ) : (
        content
      )}
      {onRemove && (
        <button
          type="button"
          disabled={disabled}
          aria-label={label}
          data-testid={partTestId(testId, 'remove')}
          className={cn(
            // Tint from the tag's own text colour so hover reads on every tone.
            'inline-flex shrink-0 items-center justify-center rounded-full p-0.5 opacity-70 transition-[background-color,opacity] hover:bg-current/15 hover:opacity-100 active:bg-current/25 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
            focus,
            classNames?.remove,
          )}
          onClick={(event) => {
            event.stopPropagation();
            if (!disabled) onRemove(event);
          }}
        >
          <KitIcon
            name="close"
            builtin={{ outline: CloseIcon, bold: CloseBoldIcon }}
            size={size === 'sm' ? 12 : 16}
          />
        </button>
      )}
    </Root>
  );
}
