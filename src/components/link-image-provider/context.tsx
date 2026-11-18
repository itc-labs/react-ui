'use client';
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
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
  current: UiRouter | undefined;
  subscribe: (listener: () => void) => () => void;
  getPathname: () => string;
  navigate: (href: string) => void;
  notify: () => void;
};

/** Keeps the router outside React state, so only components reading the path re-render. */
function createRouterStore(): RouterStore {
  const listeners = new Set<() => void>();
  const store: RouterStore = {
    current: undefined,
    subscribe(listener) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
    getPathname: () => store.current?.pathname ?? '/',
    navigate: (href) => store.current?.navigate(href),
    notify: () => listeners.forEach((listener) => listener()),
  };

  return store;
}

/** The only component that calls the host's hook; a route change re-renders just this. */
function RouterBridge({
  useRouter,
  store,
}: {
  useRouter: UiRouterAdapter;
  store: RouterStore;
}) {
  const router = useRouter();

  store.current = router;

  useLayoutEffect(() => store.notify(), [router.pathname, store]);

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
  // A hook must keep its place between renders, so the first adapter stays for this scope.
  const adapter = useRef(useRouter).current;
  const [store] = useState(() => (adapter ? createRouterStore() : undefined));
  const router = store ?? parent.router;
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
      {adapter && store && <RouterBridge useRouter={adapter} store={store} />}
      {children}
    </LinkImageContext.Provider>
  );
}
