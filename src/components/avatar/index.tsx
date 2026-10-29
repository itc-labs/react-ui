'use client';
import type { TestIdProps } from '../common/testing';

import { partTestId } from '../common/testing';

import { useUILocale } from '../../i18n/provider';
import { Avatar as Primitive } from 'radix-ui';
import { type SlotClasses, cn } from '../common';
import { useCallback, useState } from 'react';
import { useUiImage, type UiImageComponent } from '../link-image-provider';
import { Spinner } from '../spinner';
export type AvatarProps = {
  src?: string;
  alt: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square';
  loading?: boolean;
  className?: string;
  classNames?: SlotClasses<'root' | 'image' | 'fallback' | 'spinner'>;
} & TestIdProps;

export function Avatar({
  'data-testid': testId,
  src,
  alt,
  fallback,
  size = 'md',
  shape = 'circle',
  loading,
  className,
  classNames,
}: AvatarProps & { 'data-testid'?: string | undefined }) {
  const Image = useUiImage();
  const [status, setStatus] = useState<{
    src: string | undefined;
    adapter: UiImageComponent;
    state: 'loaded' | 'error';
  } | null>(null);
  const imageState =
    status !== null && status.src === src && status.adapter === Image
      ? status.state
      : 'loading';
  const imageRef = useCallback(
    (node: HTMLImageElement | null) => {
      if (node?.complete && src)
        setStatus({
          src,
          adapter: Image,
          state: node.naturalWidth > 0 ? 'loaded' : 'error',
        });
    },
    [src, Image],
  );
  const pixels = size === 'sm' ? 32 : size === 'lg' ? 80 : 48;
  const { t } = useUILocale();
  const initials =
    fallback ??
    alt
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();

  return (
    <Primitive.Root
      data-testid={testId}
      role="img"
      aria-label={alt}
      aria-busy={loading || undefined}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-line bg-brand-100 font-semibold text-ink',
        shape === 'square' ? 'rounded-control' : 'rounded-full',
        size === 'sm'
          ? 'size-8 text-ui-sm'
          : size === 'lg'
            ? 'size-20 text-section'
            : 'size-12 text-control',
        classNames?.root,
        className,
      )}
    >
      {!loading && src && imageState !== 'error' && (
        <Image
          key={src}
          ref={imageRef}
          data-testid={partTestId(testId, 'image')}
          src={src}
          alt=""
          width={pixels}
          height={pixels}
          onLoad={() => setStatus({ src, adapter: Image, state: 'loaded' })}
          onError={() => setStatus({ src, adapter: Image, state: 'error' })}
          className={cn(
            'absolute inset-0 size-full object-cover',
            imageState !== 'loaded' && 'opacity-0',
            classNames?.image,
          )}
        />
      )}
      {(loading || !src || imageState !== 'loaded') && (
        <Primitive.Fallback
          data-testid={partTestId(testId, 'fallback')}
          className={cn(
            'flex size-full items-center justify-center',
            classNames?.fallback,
          )}
        >
          {loading ? (
            <Spinner
              data-testid={partTestId(testId, 'spinner')}
              className={classNames?.spinner}
              label={t('avatar.loading')}
            />
          ) : (
            initials || '?'
          )}
        </Primitive.Fallback>
      )}
    </Primitive.Root>
  );
}
