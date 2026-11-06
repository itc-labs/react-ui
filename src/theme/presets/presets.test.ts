import { expect, it } from 'vitest';
import { themePresets } from './index';
import { defineTheme } from '../index';

function luminance(hex: string) {
  const rgb = [1, 3, 5]
    .map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );

  return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722;
}

function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return (values[0]! + 0.05) / (values[1]! + 0.05);
}

it('provides five validated light/dark presets with complete matching color keys', () => {
  expect(Object.keys(themePresets)).toEqual([
    'forest',
    'ocean',
    'violet',
    'slate',
    'ember',
  ]);
  for (const preset of Object.values(themePresets)) {
    expect(Object.keys(preset.light.tokens).sort()).toEqual(
      Object.keys(preset.dark.tokens).sort(),
    );
    for (const mode of ['light', 'dark'] as const)
      expect(() => defineTheme(preset[mode])).not.toThrow();
  }
});

it('keeps essential text and control pairs readable in every supplied mode', () => {
  for (const [name, preset] of Object.entries(themePresets)) {
    for (const mode of ['light', 'dark'] as const) {
      const colors = preset[mode].tokens;
      for (const [foreground, background, minimum] of [
        ['color-ink', 'color-surface', 4.5],
        ['color-muted', 'color-surface', 4.5],
        ['color-on-brand', 'color-brand-700', 4.5],
        ['color-control-border', 'color-surface', 3],
        ['color-focus', 'color-canvas', 3],
        ['color-danger-700', 'color-danger-50', 4.5],
        ['color-success-700', 'color-success-50', 4.5],
        ['color-info-700', 'color-info-50', 4.5],
        ['color-warning-700', 'color-warning-50', 4.5],
      ] as const)
        expect(
          contrast(colors[foreground], colors[background]),
          `${name}/${mode}: ${foreground}/${background}`,
        ).toBeGreaterThanOrEqual(minimum);
    }
  }
});
