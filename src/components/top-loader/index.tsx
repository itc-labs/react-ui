'use client';
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { cn, partTestId } from '../common';
import { attachTopLoaderClient, topLoader } from './client';
import { createTopLoaderScope } from './scope';
import { isTopLoaderNavigation } from './links';
import type {
  TopLoaderController,
  TopLoaderProps,
  TopLoaderProviderProps,
} from './types';
export { createTopLoaderClient, topLoader } from './client';
export type {
  TopLoaderController,
  TopLoaderClient,
  TopLoaderClassNames,
  TopLoaderProps,
  TopLoaderProviderProps,
} from './types';

const Context = createContext<ReturnType<typeof createTopLoaderScope> | null>(null);

function useScope() {
  const scope = useContext(Context);
  if (!scope) throw new Error('TopLoader and useTopLoader require TopLoaderProvider.');

  return scope;
}

export function useTopLoader(): TopLoaderController {
  return useScope().controller;
}

/** Decorative estimated progress; hosts own announcements and aria-busy on content. */
export function TopLoader({
  height,
  color,
  peg = true,
  className,
  classNames,
  style,
  'data-testid': testId,
  ...props
}: TopLoaderProps) {
  const scope = useScope();
  const state = useSyncExternalStore(
    scope.subscribe,
    scope.getSnapshot,
    scope.getServerSnapshot,
  );

  return (
    <div
      {...props}
      role="progressbar"
      aria-hidden="true"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(state.progress * 100)}
      data-testid={testId}
      data-state={!state.visible ? 'idle' : state.fading ? 'fading' : 'loading'}
      hidden={!state.visible}
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-toast h-1 text-brand-500 motion-safe:transition-opacity',
        state.fading ? 'opacity-0' : 'opacity-100',
        classNames?.root,
        className,
      )}
      style={{ height, color, ...style }}
    >
      <div
        data-testid={partTestId(testId, 'bar')}
        className={cn(
          'relative h-full w-full bg-current motion-safe:transition-transform motion-reduce:w-1/4 motion-reduce:transform-none!',
          classNames?.bar,
        )}
        style={{ transform: `translateX(${(state.progress - 1) * 100}%)` }}
      >
        {peg && (
          <div
            data-testid={partTestId(testId, 'peg')}
            className={cn(
              'absolute right-0 top-0 h-full w-20 bg-current blur-sm motion-reduce:hidden',
              classNames?.peg,
            )}
          />
        )}
      </div>
    </div>
  );
}

const duration = (value: number, fallback: number) =>
  Number.isFinite(value) ? Math.max(0, value) : fallback;

export function TopLoaderProvider({
  children,
  client = topLoader,
  currentPath,
  trackLinks = false,
  delay = 100,
  minimumDuration = 300,
  fadeDuration = 180,
  trickle = true,
  trickleInterval = 800,
  ...props
}: TopLoaderProviderProps) {
  const [scope] = useState(createTopLoaderScope);
  const previousPath = useRef(currentPath);

  useLayoutEffect(() => {
    scope.configure({
      delay: duration(delay, 100),
      minimumDuration: duration(minimumDuration, 300),
      fadeDuration: duration(fadeDuration, 180),
      trickle,
      trickleInterval: Math.max(16, duration(trickleInterval, 800)),
    });
  });

  useLayoutEffect(() => {
    scope.activate();

    return () => scope.dispose();
  }, [scope]);

  useLayoutEffect(
    () => (client ? attachTopLoaderClient(client, scope.controller) : undefined),
    [client, scope],
  );

  useLayoutEffect(() => {
    if (currentPath !== previousPath.current) scope.controller.done();
    previousPath.current = currentPath;
  }, [currentPath, scope]);

  useLayoutEffect(() => {
    if (!trackLinks) return;

    const onClick = (event: MouseEvent) => {
      if (isTopLoaderNavigation(event)) scope.controller.start();
    };

    document.addEventListener('click', onClick, true);

    return () => document.removeEventListener('click', onClick, true);
  }, [trackLinks, scope]);

  return (
    <Context.Provider value={scope}>
      {children}
      <TopLoader
        {...props}
        style={{
          transitionDuration: `${duration(fadeDuration, 180)}ms`,
          ...props.style,
        }}
      />
    </Context.Provider>
  );
}
