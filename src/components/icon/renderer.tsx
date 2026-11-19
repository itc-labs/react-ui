'use client';
import { cn } from '../common';
import { iconToneClasses } from '../common/tone';
import { useTheme } from '../../theme/provider';
import type { IconGlyph, IconName, IconPack, IconVariant } from './types';
import type { IconProps } from './props';

function readOwn<Value>(
  record: Readonly<Record<string, Value>> | undefined,
  key: string | undefined,
  fallback?: Value,
) {
  return key && record && Object.hasOwn(record, key) ? record[key] : fallback;
}

/** Semantic names follow the active theme. An explicit glyph/pack overrides the theme. */
export function IconRenderer<Name extends string = IconName>({
  builtins,
  getGlyph,
  name,
  pack,
  glyph,
  size,
  strokeWidth,
  label,
  variant,
  tone,
  className,
  ...props
}: IconProps<Name> & {
  builtins: Readonly<Record<string, IconPack>>;
  getGlyph?: (
    name: string | undefined,
    packName: string,
    fallbackVariant: IconVariant,
  ) => IconGlyph | undefined;
}) {
  const config = useTheme().icons;
  const fallbackVariant = variant ?? config?.variant ?? 'outline';
  const packName =
    typeof pack === 'string'
      ? pack
      : (variant ?? config?.defaultPack ?? fallbackVariant);
  const selectedPack =
    typeof pack === 'object'
      ? pack
      : readOwn(config?.packs, packName, readOwn(builtins, packName));

  if (typeof pack === 'string' && !selectedPack)
    throw new Error(`Unknown icon pack: ${pack}`);
  const explicit = pack !== undefined || variant !== undefined;
  const Glyph =
    glyph ??
    (!explicit ? readOwn(config?.overrides, name) : undefined) ??
    readOwn(selectedPack?.icons, name) ??
    readOwn(config?.packs?.[fallbackVariant]?.icons, name) ??
    readOwn(builtins[fallbackVariant]?.icons, name) ??
    getGlyph?.(name, packName, fallbackVariant);
  if (!Glyph)
    throw new Error(
      `Unregistered icon: ${name ?? '(missing glyph)'}. Import a glyph from @itclabs/react-ui/icons/outline/<name> and pass glyph={Glyph}, or import { outlineCatalog, boldCatalog } from '@itclabs/react-ui/icons/catalog' and configure UIProvider theme={defineTheme({ icons: { packs: { outline: outlineCatalog, bold: boldCatalog } } })}.`,
    );
  const resolvedSize = size ?? config?.size ?? 16;

  return (
    <Glyph
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
      width={resolvedSize}
      height={resolvedSize}
      strokeWidth={strokeWidth ?? config?.strokeWidth ?? 1.75}
      {...props}
      className={cn(tone && iconToneClasses[tone], className)}
    />
  );
}
