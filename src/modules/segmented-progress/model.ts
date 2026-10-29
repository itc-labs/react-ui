import { themeColors } from '../../theme/colors';
import type { ProgressSegment } from './types';

export function segmentColor(id: string) {
  let hash = 0;
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) | 0;

  return themeColors.chart[(hash >>> 0) % themeColors.chart.length]!;
}

export function segmentModel(segments: readonly ProgressSegment[]) {
  const values = segments.map((segment) =>
    Number.isFinite(segment.value) ? Math.max(0, segment.value) : 0,
  );
  const largest = values.reduce((max, value) => Math.max(max, value), 0);
  const scaledTotal =
    largest > 0 ? values.reduce((sum, value) => sum + value / largest, 0) : 0;
  const total = Math.min(Number.MAX_VALUE, largest * scaledTotal);

  return segments.map((segment, index) => ({
    segment,
    value: values[index]!,
    total,
    percent: scaledTotal > 0 ? (values[index]! / largest / scaledTotal) * 100 : 0,
  }));
}
