'use client';
import { kitOutlineIcons, kitBoldIcons } from './kit-icons';
import { IconRenderer } from './renderer';
import type { IconName } from './types';
import type { IconProps } from './props';
export { defineIconPack } from './registry';
export { iconNames } from './names';
export type { IconGlyph, IconName, IconPack, IconVariant, UIIconNames } from './types';
export type { IconProps } from './props';

const builtins = { outline: kitOutlineIcons, bold: kitBoldIcons };

/** Semantic names follow the active theme. An explicit glyph/pack overrides the theme. */
export function Icon<Name extends string = IconName>(props: IconProps<Name>) {
  return <IconRenderer {...props} builtins={builtins} />;
}
