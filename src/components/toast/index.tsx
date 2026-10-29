'use client';
import { createContext, useContext, useId, useLayoutEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify/unstyled';
import { useUILocale } from '../../i18n/provider';
import { cn } from '../common';
import { ToastContent, ToastStyleContext } from './content';
import { createToastScope } from './scope';
import { toastDuration } from './message';
import { toast as defaultToast } from './client';
import { attachToastClient } from './client-store';
export { toast, createToastClient } from './client';
import type { ToastController, ToastProviderProps } from './types';
export type {
  ToastMessage,
  ToastInput,
  ToastMessageOptions,
  ToastClient,
  ToastController,
  ToastClassNames,
  ToastPosition,
  ToastTone,
  ToastUpdate,
  ToastPromiseMessage,
  ToastPromiseMessages,
  ToastProviderProps,
} from './types';

const ToastContext = createContext<ToastController | null>(null);

export function ToastProvider({
  'data-testid': testId,
  children,
  client = defaultToast,
  duration = 5000,
  maxVisible = 5,
  position = 'bottom-right',
  pauseOnHover = true,
  pauseOnFocusLoss = true,
  newestOnTop = false,
  closeLabel,
  viewportLabel,
  className,
  classNames,
}: ToastProviderProps) {
  const containerId = useId();
  const { t } = useUILocale();
  const [scope] = useState(() =>
    createToastScope(containerId, (entry, props) => (
      <ToastContent entry={entry} closeToast={props.closeToast} />
    )),
  );
  const autoClose = toastDuration(duration);

  useLayoutEffect(() => {
    scope.activate(autoClose);
  });

  useLayoutEffect(() => () => scope.dispose(), [scope]);

  useLayoutEffect(
    () => (client ? attachToastClient(client, scope.controller) : undefined),
    [client, scope],
  );

  return (
    <ToastContext.Provider value={scope.controller}>
      <ToastStyleContext.Provider
        value={{
          testId,
          ...(classNames ? { classNames } : {}),
          ...(closeLabel ? { closeLabel } : {}),
        }}
      >
        {children}
        <div data-testid={testId} className="contents">
          <ToastContainer
            containerId={containerId}
            position={position}
            autoClose={autoClose}
            limit={
              Number.isFinite(maxVisible) ? Math.max(1, Math.floor(maxVisible)) : 5
            }
            newestOnTop={newestOnTop}
            pauseOnHover={pauseOnHover}
            pauseOnFocusLoss={pauseOnFocusLoss}
            closeOnClick={false}
            closeButton={false}
            icon={false}
            draggable="touch"
            hideProgressBar
            role="status"
            aria-label={viewportLabel ?? t('toast.viewport', { hotkey: 'Alt+T' })}
            className={({ defaultClassName } = {}) =>
              cn(
                defaultClassName,
                'z-[var(--z-index-toast)] w-80 max-w-[calc(100vw-2rem)] p-0 font-sans transform-none max-[480px]:mx-4 max-[480px]:w-[calc(100vw-2rem)]',
                classNames?.viewport,
                className,
              )
            }
            toastClassName={({ defaultClassName, type } = {}) =>
              cn(
                defaultClassName,
                'pod-toast relative mb-2 flex min-h-0 items-start gap-3 rounded-panel border border-line bg-surface p-4 pr-12 font-sans text-ink shadow-floating',
                type === 'info' && 'border-info-700/30',
                type === 'error' && 'border-danger-700/40',
                type === 'success' && 'border-success-700/30',
                type === 'warning' && 'border-warning-700/40',
                classNames?.toast,
              )
            }
          />
        </div>
      </ToastStyleContext.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastController {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error('useToast requires ToastProvider.');

  return notify;
}
