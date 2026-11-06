import { KitIcon } from '../icon/kit-icon';
import { CheckIcon } from '../icon/outline/check';
import { CheckIcon as CheckBoldIcon } from '../icon/bold/check';
import { CloseIcon } from '../icon/outline/close';
import { CloseIcon as CloseBoldIcon } from '../icon/bold/close';
import { WarningIcon } from '../icon/outline/warning';
import { WarningIcon as WarningBoldIcon } from '../icon/bold/warning';
import { InfoIcon } from '../icon/outline/info';
import { InfoIcon as InfoBoldIcon } from '../icon/bold/info';
import type { TimelineItem, TimelinePhase } from './index';

export function TimelineMarker({
  phase,
  status,
}: {
  phase: TimelinePhase | 'event';
  status: TimelineItem['status'];
}) {
  const glyph =
    status === 'danger'
      ? { name: 'close' as const, outline: CloseIcon, bold: CloseBoldIcon }
      : status === 'warning'
        ? { name: 'warning' as const, outline: WarningIcon, bold: WarningBoldIcon }
        : status === 'info'
          ? { name: 'info' as const, outline: InfoIcon, bold: InfoBoldIcon }
          : phase === 'completed' || status === 'success'
            ? { name: 'check' as const, outline: CheckIcon, bold: CheckBoldIcon }
            : undefined;
  if (glyph)
    return (
      <KitIcon
        name={glyph.name}
        builtin={{ outline: glyph.outline, bold: glyph.bold }}
        size={14}
      />
    );

  return (
    <span
      className={
        phase === 'upcoming'
          ? 'size-2 rounded-full border border-current'
          : 'size-2 rounded-full bg-current'
      }
    />
  );
}
