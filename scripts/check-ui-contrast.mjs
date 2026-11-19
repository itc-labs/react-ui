import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/theme/tokens.css', import.meta.url), 'utf8');
const colors = Object.fromEntries(
  [...css.matchAll(/--color-([\w-]+):\s*(#[\da-f]{6});/gi)].map((match) => [
    match[1],
    match[2],
  ]),
);

function luminance(hex) {
  const channels = [1, 3, 5]
    .map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

const pairs = [
  ['ink', 'canvas', 4.5],
  ['ink', 'surface', 4.5],
  ['muted', 'surface', 4.5],
  ['muted', 'canvas', 4.5],
  ['muted', 'sidebar', 4.5],
  ['on-brand', 'brand-700', 4.5],
  ['on-brand', 'brand-800', 4.5],
  ['brand-800', 'brand-100', 4.5],
  ['success-700', 'success-50', 4.5],
  ['warning-700', 'warning-50', 4.5],
  ['danger-700', 'danger-50', 4.5],
  ['danger-700', 'surface', 4.5],
  ['on-brand', 'danger-700', 4.5],
  ['on-brand', 'danger-800', 4.5],
  ['control-border', 'surface', 3],
  ['control-border', 'canvas', 3],
  ['brand-500', 'surface', 3],
  ['brand-500', 'canvas', 3],
];
let failed = false;
console.log(
  '| Foreground / background | Ratio | Minimum | Result |\n|---|---:|---:|---|',
);
for (const [foreground, background, minimum] of pairs) {
  if (!colors[foreground] || !colors[background])
    throw new Error('Unknown semantic color');
  const values = [luminance(colors[foreground]), luminance(colors[background])].sort(
    (a, b) => b - a,
  );
  const ratio = (values[0] + 0.05) / (values[1] + 0.05);
  const pass = ratio >= minimum;
  failed ||= !pass;
  console.log(
    `| ${foreground} / ${background} | ${ratio.toFixed(2)}:1 | ${minimum}:1 | ${pass ? 'PASS' : 'FAIL'} |`,
  );
}
// White is the brightest possible image backdrop for these dark scrims.
for (const [background, opacity] of [
  ['media-scrim', 0.6],
  ['media-scrim-danger', 0.75],
]) {
  const composite =
    '#' +
    [1, 3, 5]
      .map((offset) =>
        Math.round(
          parseInt(colors[background].slice(offset, offset + 2), 16) * opacity +
            255 * (1 - opacity),
        )
          .toString(16)
          .padStart(2, '0'),
      )
      .join('');
  const ratio = (luminance(colors['on-media']) + 0.05) / (luminance(composite) + 0.05);
  const pass = ratio >= 4.5;
  failed ||= !pass;
  console.log(
    `| on-media / ${background} ${opacity * 100}% over white | ${ratio.toFixed(2)}:1 | 4.5:1 | ${pass ? 'PASS' : 'FAIL'} |`,
  );
}

console.log(
  '\nToken pairs and media scrims over the brightest image backdrop; not a full accessibility audit. Decorative line token and disabled controls excluded.',
);
if (failed) process.exitCode = 1;
