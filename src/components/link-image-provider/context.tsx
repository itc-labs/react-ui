'use client';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type {
  UiLinkProps,
  UiImageProps,
  UiLinkComponent,
  UiImageComponent,
} from './index';

function NativeLink(props: UiLinkProps) {
  return <a {...props} />;
}

function NativeImage(props: UiImageProps) {
  return <img {...props} />;
}

export const LinkImageContext = createContext<{
  Link: UiLinkComponent;
  Image: UiImageComponent;
}>({ Link: NativeLink, Image: NativeImage });

interface AdapterProviderProps {
  Link?: UiLinkComponent;
  Image?: UiImageComponent;
  children: ReactNode;
}

/** Host-owned adapters; unspecified adapters inherit from the nearest provider. */
export function AdapterProvider({ Link, Image, children }: AdapterProviderProps) {
  const parent = useContext(LinkImageContext);
  const value = useMemo(
    () => ({ Link: Link ?? parent.Link, Image: Image ?? parent.Image }),
    [parent, Link, Image],
  );

  return (
    <LinkImageContext.Provider value={value}>{children}</LinkImageContext.Provider>
  );
}
