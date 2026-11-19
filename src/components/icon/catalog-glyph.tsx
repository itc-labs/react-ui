'use client';
import { useSyncExternalStore, type SVGProps } from 'react';
import { iconNames } from './names';
import type { IconGlyph, IconVariant } from './types';

// Development validates synchronously; production validates against the deferred manifest.
const names =
  process.env.NODE_ENV !== 'production' ? new Set<string>(iconNames) : undefined;
const cache = new Map<string, IconGlyph>();

const serverSnapshot = () => undefined;

function createEntry(name: (typeof iconNames)[number], variant: IconVariant) {
  let snapshot: { glyph: IconGlyph } | { error: unknown } | undefined;
  let request: Promise<void> | undefined;
  const listeners = new Set<() => void>();

  const getSnapshot = () => snapshot;

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    request ??= import('./loaders')
      .then((module) => {
        const loaders = module.iconLoaders[variant];
        if (!Object.hasOwn(loaders, name))
          throw new Error(`Unregistered icon: ${name}`);

        return loaders[name]();
      })
      .then(
        (glyph) => {
          snapshot = { glyph };
        },
        (error: unknown) => {
          snapshot = { error };
        },
      )
      .then(() => {
        for (const notify of listeners) notify();
      });

    return () => {
      listeners.delete(listener);
    };
  };

  return function CatalogGlyph(props: SVGProps<SVGSVGElement>) {
    const snapshot = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);
    if (snapshot && 'error' in snapshot) throw snapshot.error;
    if (snapshot) {
      const Glyph = snapshot.glyph;

      return <Glyph {...props} />;
    }

    return (
      <svg
        {...props}
        children={undefined}
        aria-hidden="true"
        aria-label={undefined}
        role={undefined}
      />
    );
  };
}

/** Only the public Icon entry opts into catalog loading; narrow kit controls stay small. */
export function resolveCatalogGlyph(
  name: string | undefined,
  packName: string,
  fallbackVariant: IconVariant,
) {
  const variant =
    packName === 'outline' || packName === 'bold' ? packName : fallbackVariant;
  if (!name || (names && !names.has(name))) return undefined;
  const key = `${variant}/${name}`;
  let entry = cache.get(key);
  if (!entry) {
    entry = createEntry(name as (typeof iconNames)[number], variant);
    cache.set(key, entry);
  }

  return entry;
}
