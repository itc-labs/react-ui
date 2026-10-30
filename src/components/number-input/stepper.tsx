'use client';

import { KitIcon } from '../icon/kit-icon';
import { ChevronUpIcon } from '../icon/outline/chevron-up';
import { ChevronUpIcon as ChevronUpBoldIcon } from '../icon/bold/chevron-up';
import { ChevronDownIcon } from '../icon/outline/chevron-down';
import { ChevronDownIcon as ChevronDownBoldIcon } from '../icon/bold/chevron-down';
import { partTestId } from '../common/testing';
import { cn } from '../common';
import { focusRingClassName } from '../common/focus-ring';
import { useUILocale } from '../../i18n/provider';
const builtinIcons = {
  chevronUp: { outline: ChevronUpIcon, bold: ChevronUpBoldIcon },
  chevronDown: { outline: ChevronDownIcon, bold: ChevronDownBoldIcon },
};

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
          <KitIcon
            name={direction === 1 ? 'chevronUp' : 'chevronDown'}
            builtin={builtinIcons[direction === 1 ? 'chevronUp' : 'chevronDown']}
            size={12}
          />
        </button>
      ))}
    </span>
  );
}
