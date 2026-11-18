'use client';
import { interactiveTrigger } from '../common/interactive-trigger';

import {
  useContext,
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
export type UiRouter = { pathname: string };
/** A hook that reads the host router's path. Define it outside components. */
export type UiRouterAdapter = () => UiRouter;

const subscribeToNothing = () => () => {};

const getNoPath = () => undefined;

export function useUiLink(): UiLinkComponent {
  return useContext(LinkImageContext).Link;
}

export function useUiImage(): UiImageComponent {
  return useContext(LinkImageContext).Image;
}

/** An explicit path wins and needs no subscription; otherwise a configured adapter supplies it. */
export function useRouterPath(currentPath?: string) {
  const context = useContext(LinkImageContext).router;
  const store = currentPath === undefined ? context : undefined;
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
