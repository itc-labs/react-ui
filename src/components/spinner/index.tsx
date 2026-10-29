'use client';
import { useUILocale } from '../../i18n/provider';
import { IconRenderer } from '../icon/renderer';
import { SpinnerIcon } from '../icon/custom/spinner';
import { type SlotClasses, cn } from '../common';

const spinnerPack = { id: 'outline', icons: { spinner: SpinnerIcon } };
const spinnerPacks = { outline: spinnerPack, bold: { ...spinnerPack, id: 'bold' } };

export function Spinner({
  'data-testid': testId,
  label,
  className,
  classNames,
  size = 16,
}: {
  'data-testid'?: string | undefined;
  label?: string;
  className?: string | undefined;
  size?: number;
  classNames?: SlotClasses<'root' | 'icon' | 'label'>;
}) {
  const { t } = useUILocale();

  return (
    <span
      data-testid={testId}
      role="status"
      className={cn('inline-flex items-center', classNames?.root, className)}
    >
      <IconRenderer
        builtins={spinnerPacks}
        name="spinner"
        size={size}
        className={cn('motion-safe:animate-spin', classNames?.icon)}
      />
      <span className={cn('sr-only', classNames?.label)}>
        {label ?? t('common.loading')}
      </span>
    </span>
  );
}
