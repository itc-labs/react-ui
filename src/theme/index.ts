import { validateThemeTokens } from './tokens';
import type { UIThemeTokens } from './token-names';
export {
  uiThemeTokenNames,
  type UIThemeTokenName,
  type UIThemeTokens,
} from './token-names';
import type { ThemeColors } from './colors';
export { themeColors, type ThemeColors } from './colors';
import type {
  IconGlyph,
  IconName,
  IconPack,
  IconVariant,
} from '../components/icon/types';
export { defineIconPack } from '../components/icon/registry';
export type {
  IconGlyph,
  IconName,
  IconPack,
  UIIconNames,
} from '../components/icon/types';

export interface IconTheme {
  readonly packs?: Readonly<Record<string, IconPack>>;
  readonly defaultPack?: string;
  readonly variant?: IconVariant;
  readonly overrides?: Readonly<Partial<Record<IconName, IconGlyph>>>;
  readonly size?: number;
  readonly strokeWidth?: number;
}
export interface UITheme {
  readonly icons?: IconTheme;
  readonly tokens?: Readonly<UIThemeTokens>;
}

export interface ResolvedUITheme extends UITheme {
  readonly colors: ThemeColors;
}

/** Validate and snapshot icon settings and serializable CSS token overrides. */
export function defineTheme(theme: UITheme): UITheme {
  const tokens = theme.tokens ? validateThemeTokens(theme.tokens) : undefined;
  const icons = theme.icons;
  if (!icons) return Object.freeze(tokens ? { tokens } : {});
  if (icons.variant !== undefined && !['outline', 'bold'].includes(icons.variant)) {
    throw new Error('Icon variant must be outline or bold');
  }
  if (
    icons.defaultPack &&
    !['outline', 'bold'].includes(icons.defaultPack) &&
    (!icons.packs || !Object.hasOwn(icons.packs, icons.defaultPack))
  ) {
    throw new Error(`Unknown default icon pack: ${icons.defaultPack}`);
  }
  for (const [name, pack] of Object.entries(icons.packs ?? {})) {
    if (name !== pack.id)
      throw new Error(`Icon pack key "${name}" must match id "${pack.id}"`);
  }
  for (const [name, value] of [
    ['size', icons.size],
    ['strokeWidth', icons.strokeWidth],
  ] as const) {
    if (value !== undefined && (!Number.isFinite(value) || value <= 0))
      throw new Error(`Icon ${name} must be positive`);
  }

  return Object.freeze({
    ...(tokens ? { tokens } : {}),
    icons: Object.freeze({
      ...icons,
      ...(icons.packs
        ? {
            packs: Object.freeze(
              Object.fromEntries(
                Object.entries(icons.packs).map(([name, pack]) => [
                  name,
                  Object.freeze({
                    id: pack.id,
                    icons: Object.freeze({ ...pack.icons }),
                  }),
                ]),
              ),
            ),
          }
        : {}),
      ...(icons.overrides ? { overrides: Object.freeze({ ...icons.overrides }) } : {}),
    }),
  });
}
