'use client';
import { createContext, useContext, useSyncExternalStore } from 'react';
import type { ToastContentProps } from 'react-toastify/unstyled';
import { useUILocale } from '../../i18n/provider';
import { Icon } from '../icon';
import { IconButton } from '../icon-button';
import { Spinner } from '../spinner';
import { partTestId } from '../common/testing';
import { cn } from '../common';
import type { ToastEntry } from './entry';
import type { ToastClassNames } from './types';

export const ToastStyleContext = createContext<{
  testId?: string | undefined;
  classNames?: ToastClassNames;
  closeLabel?: string;
}>({});

export function ToastContent({
  entry,
  closeToast,
}: {
  entry: ToastEntry;
  closeToast: ToastContentProps['closeToast'];
}) {
  const message = useSyncExternalStore(
    entry.subscribe,
    entry.getSnapshot,
    entry.getSnapshot,
  );
  const { t } = useUILocale();
  const styles = useContext(ToastStyleContext);

  const testId = message['data-testid'] ?? partTestId(styles.testId, 'toast', entry.id);

  const classes = (slot: keyof ToastClassNames) => styles.classNames?.[slot];

  const iconClass = cn(
    'mt-0.5 shrink-0',
    message.loading
      ? 'text-muted'
      : message.tone === 'error'
        ? 'text-danger-700'
        : message.tone === 'success'
          ? 'text-success-700'
          : message.tone === 'warning'
            ? 'text-warning-700'
            : 'text-info-700',
    classes('icon'),
  );

  return (
    <div data-testid={testId} className="contents">
      {message.loading ? (
        <span aria-hidden="true">
          <Spinner classNames={{ icon: iconClass }} />
        </span>
      ) : (
        <Icon
          name={
            message.tone === 'error' || message.tone === 'warning'
              ? 'warning'
              : message.tone === 'success'
                ? 'success'
                : 'info'
          }
          className={iconClass}
        />
      )}
      <div className={cn('min-w-0 flex-1', classes('content'))}>
        <div className={cn('text-control font-semibold', classes('title'))}>
          {message.title}
        </div>
        {message.description && (
          <div className={cn('mt-1 text-ui-sm text-muted', classes('description'))}>
            {message.description}
          </div>
        )}
      </div>
      <IconButton
        data-testid={partTestId(testId, 'close')}
        icon="close"
        label={styles.closeLabel ?? t('toast.close')}
        variant="ghost"
        size="sm"
        onClick={() => closeToast()}
        className={cn('absolute right-2 top-2', classes('close'))}
      />
    </div>
  );
}
