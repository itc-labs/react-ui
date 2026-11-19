'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useUILocale } from '../../i18n/provider';
import { AlertDialog, AlertDialogCancel } from '../alert-dialog';
import { Button } from '../button';
import { cn, partTestId, type SlotClasses, type TestIdProps } from '../common';
import { DropdownMenu, type DropdownMenuItemTone } from '../dropdown-menu';
import { Icon, type IconGlyph, type IconName } from '../icon';
import { KitIcon } from '../icon/kit-icon';
import { ChevronDownIcon } from '../icon/outline/chevron-down';
import { ChevronDownIcon as ChevronDownBoldIcon } from '../icon/bold/chevron-down';
import { CloseIcon } from '../icon/outline/close';
import { CloseIcon as CloseBoldIcon } from '../icon/bold/close';
import { CheckIcon } from '../icon/outline/check';
import { CheckIcon as CheckBoldIcon } from '../icon/bold/check';
import { Spinner } from '../spinner';
import { Tag, type TagSize, type TagTone } from '../tag';

export type StatusOption<V extends string> = {
  value: V;
  label: ReactNode;
  tone: TagTone;
  icon?: IconName | IconGlyph;
  actionLabel?: ReactNode;
  actionTone?: DropdownMenuItemTone;
  danger?: boolean;
  confirm?: {
    title: NonNullable<ReactNode>;
    description?: ReactNode;
    confirmLabel?: ReactNode;
    cancelLabel?: ReactNode;
  };
};
export type StatusTagClassNames = SlotClasses<
  'root' | 'tag' | 'menu' | 'item' | 'dialog'
>;
export type StatusTagProps<V extends string> = TestIdProps & {
  value: V;
  options: readonly StatusOption<V>[];
  /** Omit a status entry to allow all other options; an empty list makes it final. */
  transitions?: Partial<Record<V, readonly V[]>>;
  exclude?: readonly V[];
  /** Controlled: update value on success. Handle application errors here; uncaught failures are logged and leave the confirmation open for retry. */
  onValueChange?: (next: V) => void | Promise<unknown>;
  disabled?: boolean;
  loading?: boolean;
  size?: TagSize;
  showIcon?: boolean;
  'aria-label'?: string;
  menuLabel?: ReactNode;
  className?: string;
  classNames?: StatusTagClassNames;
};

export function StatusTag<V extends string>({
  value,
  options,
  transitions,
  exclude,
  onValueChange,
  disabled = false,
  loading = false,
  size = 'sm',
  showIcon = false,
  'aria-label': ariaLabel,
  menuLabel,
  className,
  classNames,
  'data-testid': testId,
}: StatusTagProps<V>) {
  const { t } = useUILocale();
  const id = useId();
  const trigger = useRef<HTMLSpanElement | HTMLButtonElement>(null);
  const inFlight = useRef(false);
  const restoreFocus = useRef(false);
  const [pending, setPending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<StatusOption<V> | null>(null);
  const current = options.find((option) => option.value === value);
  const allowed = transitions?.[value];
  const next = options.filter(
    (option) =>
      option.value !== value &&
      (allowed === undefined || allowed.includes(option.value)) &&
      !exclude?.includes(option.value),
  );
  const editable = !!current && !!onValueChange && next.length > 0;
  const busy = loading || pending;
  const blocked = disabled || busy;

  useEffect(() => {
    if (!current && process.env.NODE_ENV !== 'production')
      console.warn(`StatusTag: unknown value "${value}". Add it to options.`);
  }, [current, value]);

  useEffect(() => {
    if (blocked) setMenuOpen(false);
  }, [blocked]);

  useEffect(() => {
    if (!pending && restoreFocus.current && !confirmation) {
      restoreFocus.current = false;
      trigger.current?.focus();
    }
  }, [pending, confirmation]);

  async function change(option: StatusOption<V>) {
    if (blocked || inFlight.current || !onValueChange) return;
    inFlight.current = true;
    restoreFocus.current = true;
    setPending(true);
    setMenuOpen(false);
    try {
      await onValueChange(option.value);
      setConfirmation(null);
    } catch (error) {
      // Hosts own user-facing error feedback; report every unhandled failure.
      console.error('StatusTag: onValueChange failed.', error);
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  function resolveMenuTone(option: StatusOption<V>): DropdownMenuItemTone {
    return (
      // Menu items stay plain unless the option opts in with actionTone.
      option.actionTone ?? (option.danger ? 'danger' : 'default')
    );
  }

  const tag = (
    <Tag
      ref={trigger}
      tone={current?.tone ?? 'neutral'}
      size={size}
      {...(showIcon && current?.icon ? { icon: current.icon } : {})}
      {...(editable ? { onClick: () => {} } : {})}
      disabled={blocked}
      tabIndex={editable ? undefined : -1}
      aria-busy={busy || undefined}
      aria-labelledby={editable ? `${id}-label ${id}-action` : undefined}
      className={classNames?.tag}
      data-testid={partTestId(testId, 'tag')}
    >
      <span className="inline-flex items-center gap-1">
        {busy && <Spinner size={12} data-testid={partTestId(testId, 'spinner')} />}
        <span id={`${id}-label`}>{current?.label ?? value}</span>
        {editable && (
          <>
            <span id={`${id}-action`} className="sr-only">
              {ariaLabel ?? t('statusTag.changeStatus')}
            </span>
            <KitIcon
              name="chevronDown"
              builtin={{ outline: ChevronDownIcon, bold: ChevronDownBoldIcon }}
              size={size === 'sm' ? 12 : 16}
            />
          </>
        )}
      </span>
    </Tag>
  );

  return (
    <span
      className={cn('inline-flex', classNames?.root, className)}
      data-testid={testId}
    >
      {editable ? (
        <DropdownMenu
          open={menuOpen && !blocked}
          onOpenChange={(open) => {
            if (!blocked) setMenuOpen(open);
          }}
          trigger={tag}
          triggerAsChild
          triggerDisabled={blocked}
          header={menuLabel}
          {...(testId ? { 'data-testid': partTestId(testId, 'menu')! } : {})}
          classNames={{ content: classNames?.menu ?? '', item: classNames?.item ?? '' }}
          contentProps={{
            onCloseAutoFocus: (event) => {
              if (confirmation || inFlight.current) event.preventDefault();
            },
          }}
          items={next.map((option) => ({
            id: option.value,
            label: option.actionLabel ?? option.label,
            ...(option.icon ? { icon: option.icon } : {}),
            tone: resolveMenuTone(option),
            disabled: blocked,
            onSelect: () => {
              if (blocked || inFlight.current) return;
              if (option.confirm) setConfirmation(option);
              else void change(option);
            },
          }))}
        />
      ) : (
        tag
      )}
      <AlertDialog
        open={confirmation !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setConfirmation(null);
        }}
        title={confirmation?.confirm?.title ?? ''}
        description={confirmation?.confirm?.description}
        confirmLoading={busy}
        className={classNames?.dialog ?? ''}
        {...(testId ? { 'data-testid': partTestId(testId, 'dialog')! } : {})}
        contentProps={{
          onCloseAutoFocus: (event) => {
            event.preventDefault();
            trigger.current?.focus();
          },
        }}
        footer={
          <>
            <AlertDialogCancel asChild>
              <Button
                variant="secondary"
                disabled={busy}
                data-testid={partTestId(testId, 'dialog', 'cancel')}
              >
                <KitIcon
                  name="close"
                  builtin={{ outline: CloseIcon, bold: CloseBoldIcon }}
                />
                {confirmation?.confirm?.cancelLabel ?? t('alertDialog.cancel')}
              </Button>
            </AlertDialogCancel>
            <Button
              variant={
                confirmation &&
                (confirmation.danger || resolveMenuTone(confirmation) === 'danger')
                  ? 'danger'
                  : 'primary'
              }
              loading={busy}
              disabled={disabled}
              data-testid={partTestId(testId, 'dialog', 'confirm')}
              onClick={() => {
                if (confirmation) void change(confirmation);
              }}
            >
              {confirmation?.icon ? (
                <Icon
                  {...(typeof confirmation.icon === 'string'
                    ? { name: confirmation.icon }
                    : { glyph: confirmation.icon })}
                />
              ) : (
                <KitIcon
                  name="check"
                  builtin={{ outline: CheckIcon, bold: CheckBoldIcon }}
                />
              )}
              {confirmation?.confirm?.confirmLabel ?? t('alertDialog.confirm')}
            </Button>
          </>
        }
      />
    </span>
  );
}
