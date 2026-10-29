import { useRef, type ReactNode } from 'react';
import { useUILocale } from '../../i18n/provider';
import { AlertDialog } from '../alert-dialog';
import { Dialog } from '../dialog';
import { Alert } from '../alert';
import { Button } from '../button';
import { cn, partTestId } from '../common';
import type { ModalClassNames, ModalProviderProps } from './types';
import type { ModalEntry, ModalScope } from './scope';

function mergeClasses(
  defaults?: ModalClassNames,
  overrides?: ModalClassNames,
): ModalClassNames {
  const merged = { ...defaults, ...overrides };
  for (const key of Object.keys(merged) as (keyof ModalClassNames)[])
    merged[key] = cn(defaults?.[key], overrides?.[key]);

  return merged;
}

export function ModalEntryView({
  entry,
  scope,
  defaults,
  children,
}: {
  entry: ModalEntry;
  scope: ModalScope;
  defaults: Omit<ModalProviderProps, 'children' | 'client'>;
  children?: ReactNode;
}) {
  const { t } = useUILocale();
  // Imperative dialogs have no Radix Trigger. Restore the opener through Radix's
  // close autofocus lifecycle, including an opener inside the underlying dialog.
  const opener = useRef<HTMLElement | null>(null);
  const options = entry.options;
  const testId =
    options['data-testid'] ?? partTestId(defaults['data-testid'], 'modal', entry.id);
  const classNames = mergeClasses(defaults.classNames, options.classNames);
  const common = {
    title: options.title,
    description: options.description,
    open: true,
    onOpenChange: (open: boolean) => {
      if (!open) entry.api.dismiss();
    },
    className: cn(defaults.className, options.className),
    classNames,
    ...(testId === undefined ? {} : { 'data-testid': testId }),
    contentProps: {
      onOpenAutoFocus: () => {
        opener.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
      },
      onCloseAutoFocus: (event: Event) => {
        event.preventDefault();
        if (opener.current?.isConnected) opener.current.focus();
      },
    },
  };

  if (entry.kind === 'open') {
    return (
      <Dialog {...common} footer={entry.options.actions?.(entry.api)}>
        {entry.options.content(entry.api)}
        {children}
      </Dialog>
    );
  }

  if (entry.kind === 'alert') {
    const tone = entry.options.tone ?? 'info';

    return (
      <AlertDialog
        {...common}
        footer={
          <Button
            data-testid={partTestId(testId, 'ok')}
            className={classNames.ok}
            onClick={() => entry.api.close()}
          >
            {entry.options.okLabel ?? t('modal.ok')}
          </Button>
        }
      >
        <Alert
          tone={tone}
          variant="inline"
          className={classNames.accent}
          classNames={classNames.icon === undefined ? {} : { icon: classNames.icon }}
        >
          {entry.options.content}
        </Alert>
        {children}
      </AlertDialog>
    );
  }

  const rawMessage =
    typeof entry.error === 'string'
      ? entry.error
      : entry.error instanceof Error
        ? entry.error.message
        : undefined;
  const errorMessage =
    entry.options.showErrorMessage && rawMessage ? rawMessage : t('modal.confirmError');

  return (
    <AlertDialog
      {...common}
      {...(entry.options.confirmLabel === undefined
        ? {}
        : { confirmLabel: entry.options.confirmLabel })}
      {...(entry.options.cancelLabel === undefined
        ? {}
        : { cancelLabel: entry.options.cancelLabel })}
      confirmVariant={
        entry.options.tone === 'danger' ? ('danger' as const) : ('primary' as const)
      }
      closeOnConfirm={false}
      confirmLoading={entry.loading}
      onConfirm={() => {
        void scope.confirm(entry);
      }}
    >
      {entry.options.content}
      {entry.failed && (
        <Alert
          variant="inline"
          tone="danger"
          data-testid={partTestId(testId, 'error')}
          className={classNames.error}
        >
          {errorMessage}
        </Alert>
      )}
      {children}
    </AlertDialog>
  );
}
