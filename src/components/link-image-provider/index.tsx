'use client';
import { interactiveTrigger } from '../common/interactive-trigger';

import {
  useContext,
  useMemo,
  useSyncExternalStore,
  type ComponentProps,
  type ComponentType,
} from 'react';
import { LinkImageContext } from './context';

export type UiLinkProps = Omit<ComponentProps<'a'>, 'href'> & {
  href: string;
  'data-testid'?: string | undefined;
};
export type UiImageProps = Omit<
  ComponentProps<'img'>,
  'src' | 'alt' | 'width' | 'height'
> & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  'data-testid'?: string | undefined;
};
export type UiLinkComponent = ComponentType<UiLinkProps>;
export type UiImageComponent = ComponentType<UiImageProps>;
export type UiRouter = {
  pathname: string;
  navigate: (href: string) => void;
};
/** A hook that reads the host router. Define it outside components so its identity is stable. */
export type UiRouterAdapter = () => UiRouter;

function subscribeToHistory(onChange: () => void) {
  window.addEventListener('popstate', onChange);

  return () => window.removeEventListener('popstate', onChange);
}

function browserNavigate(href: string) {
  window.location.assign(href);
}

export function useUiLink(): UiLinkComponent {
  return useContext(LinkImageContext).Link;
}

export function useUiImage(): UiImageComponent {
  return useContext(LinkImageContext).Image;
}

const getBrowserPath = () => window.location.pathname;

const getServerPath = () => '/';

const subscribeToNothing = () => () => {};

const getNoPath = () => undefined;

/** The current path and navigation. Re-renders on every route change. */
export function useUiRouter(): UiRouter {
  const store = useContext(LinkImageContext).router;
  const pathname = useSyncExternalStore(
    store?.subscribe ?? subscribeToHistory,
    store?.getPathname ?? getBrowserPath,
    store?.getPathname ?? getServerPath,
  );
  const navigate = store?.navigate ?? browserNavigate;

  return useMemo(() => ({ pathname, navigate }), [pathname, navigate]);
}

/** A stable navigate function that does not re-render the caller when the route changes. */
export function useUiNavigate() {
  return useContext(LinkImageContext).router?.navigate ?? browserNavigate;
}

/** An explicit path wins; otherwise only a configured adapter supplies one. */
export function useRouterPath(currentPath?: string) {
  const store = useContext(LinkImageContext).router;
  const pathname = useSyncExternalStore(
    store?.subscribe ?? subscribeToNothing,
    store?.getPathname ?? getNoPath,
    store?.getPathname ?? getNoPath,
  );

  return currentPath ?? pathname;
}

export function UiLink(props: UiLinkProps) {
  const Link = useUiLink();

  return <Link {...props} />;
}

export function UiImage(props: UiImageProps) {
  const Image = useUiImage();

  return <Image {...props} />;
}

UiLink[interactiveTrigger] = true;
