'use client';
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  UiLinkProps,
  UiImageProps,
  UiLinkComponent,
  UiImageComponent,
  UiRouter,
  UiRouterAdapter,
} from './index';

function NativeLink(props: UiLinkProps) {
  return <a {...props} />;
}

function NativeImage(props: UiImageProps) {
  return <img {...props} />;
}

export type RouterStore = {
  subscribe: (listener: () => void) => () => void;
  getPathname: () => string | undefined;
  seed: (pathname: string) => void;
  publish: (pathname: string) => void;
};

/** Keeps the path outside React state, so only components reading it re-render. */
function createRouterStore(): RouterStore {
  const listeners = new Set<() => void>();
  let current: string | undefined;

  return {
    subscribe(listener) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    getPathname: () => current,
    seed(pathname) {
      current ??= pathname;
    },
    publish(pathname) {
      if (pathname === current) return;

      current = pathname;

      listeners.forEach((listener) => listener());
    },
  };
}

const adapterKeys = new WeakMap<UiRouterAdapter, number>();
let nextAdapterKey = 0;

function adapterKey(adapter: UiRouterAdapter) {
  const key = adapterKeys.get(adapter) ?? nextAdapterKey++;

  adapterKeys.set(adapter, key);

  return key;
}

/** The only component that calls the host's hook; a route change re-renders just this. */
function RouterBridge({
  useRouter,
  store,
}: {
  useRouter: UiRouterAdapter;
  store: RouterStore;
}) {
  const { pathname } = useRouter();

  // The first value serves the initial render and SSR. Later values wait for commit, so a
  // suspended route transition never reaches components still showing the previous page.
  store.seed(pathname);

  useLayoutEffect(() => store.publish(pathname), [pathname, store]);

  return null;
}

export const LinkImageContext = createContext<{
  Link: UiLinkComponent;
  Image: UiImageComponent;
  router?: RouterStore;
}>({ Link: NativeLink, Image: NativeImage });

interface AdapterProviderProps {
  Link?: UiLinkComponent;
  Image?: UiImageComponent;
  useRouter?: UiRouterAdapter;
  children: ReactNode;
}

/** Host-owned adapters; unspecified adapters inherit from the nearest provider. */
export function AdapterProvider({
  Link,
  Image,
  useRouter,
  children,
}: AdapterProviderProps) {
  const parent = useContext(LinkImageContext);
  const [store] = useState(createRouterStore);
  const router = useRouter ? store : parent.router;
  const value = useMemo(
    () => ({
      Link: Link ?? parent.Link,
      Image: Image ?? parent.Image,
      ...(router ? { router } : {}),
    }),
    [parent, Link, Image, router],
  );

  return (
    <LinkImageContext.Provider value={value}>
      {useRouter && (
        // A new adapter is a different hook, so it gets a new bridge instead of a new hook order.
        <RouterBridge key={adapterKey(useRouter)} useRouter={useRouter} store={store} />
      )}
      {children}
    </LinkImageContext.Provider>
  );
}
