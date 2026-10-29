import type { ProgressTone } from '../../components/progress';
import { normalizeProgress } from '../../components/progress/model';
import type { ProgressListItem, ProgressThreshold } from './types';

export function itemProgress(item: ProgressListItem) {
  return normalizeProgress(
    item.percent ?? item.value,
    item.percent !== undefined ? 100 : item.max,
  );
}

export function thresholdTone(
  percent: number,
  thresholds: readonly ProgressThreshold[],
  fallback: ProgressTone,
): ProgressTone {
  let matched = -Infinity;
  let tone = fallback;
  for (const threshold of thresholds) {
    if (
      Number.isFinite(threshold.min) &&
      threshold.min <= percent &&
      threshold.min >= matched
    ) {
      matched = threshold.min;
      tone = threshold.tone;
    }
  }

  return tone;
}
