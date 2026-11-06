import { forestTheme } from './forest';
export { forestTheme } from './forest';
import { oceanTheme } from './ocean';
export { oceanTheme } from './ocean';
import { violetTheme } from './violet';
export { violetTheme } from './violet';
import { slateTheme } from './slate';
export { slateTheme } from './slate';
import { emberTheme } from './ember';
export { emberTheme } from './ember';
export type { ThemePreset, ThemePresetMode } from './types';

export const themePresets = {
  forest: forestTheme,
  ocean: oceanTheme,
  violet: violetTheme,
  slate: slateTheme,
  ember: emberTheme,
} as const;
export type ThemePresetName = keyof typeof themePresets;
