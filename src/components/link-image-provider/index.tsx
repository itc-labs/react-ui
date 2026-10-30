'use client';
import { interactiveTrigger } from '../common/interactive-trigger';

import { useContext, type ComponentProps, type ComponentType } from 'react';
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
