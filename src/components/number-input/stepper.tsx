'use client';
import { partTestId } from '../common/testing';
import { Icon } from '../icon';
import { cn } from '../common';
import { focusRingClassName } from '../common/focus-ring';
import { useUILocale } from '../../i18n/provider';

export function NumberStepper({
  'data-testid': testId,
  disabled,
  decreaseDisabled,
  increaseDisabled,
  onStep,
  className,
  buttonClassName,
}: {
  'data-testid'?: string | undefined;
  disabled: boolean;
  decreaseDisabled: boolean;
  increaseDisabled: boolean;
  onStep: (direction: 1 | -1) => void;
  className?: string;
  buttonClassName?: string;
}) {
  const { t } = useUILocale();

  return (
    <span
      data-testid={partTestId(testId, 'stepper')}
      className={cn('grid shrink-0 grid-rows-2', className)}
    >
      {([1, -1] as const).map((direction) => (
        <button
          data-testid={partTestId(testId, direction === 1 ? 'increase' : 'decrease')}
          type="button"
          key={direction}
          aria-label={t(direction === 1 ? 'number.increase' : 'number.decrease')}
          disabled={disabled || (direction === 1 ? increaseDisabled : decreaseDisabled)}
          className={cn(
            'grid h-4 w-6 cursor-pointer place-items-center rounded text-muted hover:bg-hover hover:text-accent disabled:cursor-not-allowed disabled:opacity-40',
            focusRingClassName,
            buttonClassName,
          )}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onStep(direction)}
        >
          <Icon name={direction === 1 ? 'chevronUp' : 'chevronDown'} size={12} />
        </button>
      ))}
    </span>
  );
}
