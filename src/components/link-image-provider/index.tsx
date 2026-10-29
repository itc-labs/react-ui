'use client';
import { interactiveTrigger } from '../common/interactive-trigger';

import {
  createContext,
  useContext,
  useMemo,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
} from 'react';

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

function NativeLink(props: UiLinkProps) {
  return <a {...props} />;
}

function NativeImage(props: UiImageProps) {
  return <img {...props} />;
}

const LinkImageContext = createContext<{
  Link: UiLinkComponent;
  Image: UiImageComponent;
}>({ Link: NativeLink, Image: NativeImage });

export interface LinkImageProviderProps {
  Link?: UiLinkComponent;
  Image?: UiImageComponent;
  children: ReactNode;
}

/** Host-owned adapters; unspecified adapters inherit from the nearest provider. */
export function LinkImageProvider({ Link, Image, children }: LinkImageProviderProps) {
  const parent = useContext(LinkImageContext);
  const value = useMemo(
    () => ({ Link: Link ?? parent.Link, Image: Image ?? parent.Image }),
    [parent, Link, Image],
  );

  return (
    <LinkImageContext.Provider value={value}>{children}</LinkImageContext.Provider>
  );
}

export function useUiLink(): UiLinkComponent {
  return useContext(LinkImageContext).Link;
}

export function useUiImage(): UiImageComponent {
  return useContext(LinkImageContext).Image;
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
