'use client';
import { useTheme } from '../../theme/provider';
import type { IconGlyph, IconName, IconPack } from './types';
import type { IconProps } from './props';

/** Semantic names follow the active theme. An explicit glyph/pack overrides the theme. */
export function IconRenderer<Name extends string = IconName>({
  builtins,
  name,
  pack,
  glyph,
  size,
  strokeWidth,
  label,
  variant,
  ...props
}: IconProps<Name> & { builtins: Readonly<Record<string, IconPack>> }) {
  const config = useTheme().icons;
  const packName =
    typeof pack === 'string'
      ? pack
      : (variant ?? config?.defaultPack ?? config?.variant ?? 'outline');
  const selectedPack =
    typeof pack === 'object'
      ? pack
      : config?.packs && Object.hasOwn(config.packs, packName)
        ? config.packs[packName]
        : Object.hasOwn(builtins, packName)
          ? builtins[packName]
          : undefined;

  const readGlyph = (
    icons: Readonly<Record<string, IconGlyph | undefined>> | undefined,
  ) => (name && icons && Object.hasOwn(icons, name) ? icons[name] : undefined);

  if (typeof pack === 'string' && !selectedPack)
    throw new Error(`Unknown icon pack: ${pack}`);
  const explicit = pack !== undefined || variant !== undefined;
  const fallbackVariant = variant ?? config?.variant ?? 'outline';
  const Glyph =
    glyph ??
    (!explicit ? readGlyph(config?.overrides) : undefined) ??
    readGlyph(selectedPack?.icons) ??
    readGlyph(config?.packs?.[fallbackVariant]?.icons) ??
    readGlyph(builtins[fallbackVariant]?.icons);
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
    />
  );
}
