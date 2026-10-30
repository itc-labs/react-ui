'use client';

import { KitIcon } from '../../components/icon/kit-icon';
import { CheckIcon } from '../../components/icon/outline/check';
import { CheckIcon as CheckBoldIcon } from '../../components/icon/bold/check';
import type { TestIdProps } from '../../components/common/testing';

import { useUILocale } from '../../i18n/provider';
import type { ComponentProps, ReactNode } from 'react';
import { type SlotClasses, cn } from '../../components/common';

export type StepperProps = (ComponentProps<'ol'> & {
  steps: readonly { id: string; label: ReactNode }[];
  currentStep: string;
  classNames?: SlotClasses<
    | 'root'
    | 'step'
    | 'currentStep'
    | 'completedStep'
    | 'separator'
    | 'indicator'
    | 'label'
  >;
}) &
  TestIdProps;

/** Read-only progress. The feature owns transitions; this does not act as tabs or routing. */
export function Stepper({
  steps,
  currentStep,
  className,
  classNames,
  'aria-label': label,
  ...props
}: StepperProps) {
  const { t } = useUILocale();
  const current = steps.findIndex((step) => step.id === currentStep);

  return (
    <ol
      {...props}
      aria-label={label ?? t('stepper.label')}
      className={cn(
        'flex flex-wrap items-center gap-x-5 gap-y-2 text-ui-sm',
        classNames?.root,
        className,
      )}
    >
      {steps.map((step, index) => (
        <li
          key={step.id}
          aria-current={index === current ? 'step' : undefined}
          className={cn(
            'flex min-w-0 items-center gap-2 [overflow-wrap:anywhere]',
            index <= current ? 'font-medium text-selected-ink' : 'text-muted',
            classNames?.step,
            index === current && classNames?.currentStep,
            index < current && classNames?.completedStep,
          )}
        >
          {index > 0 && (
            <span
              aria-hidden="true"
              className={cn('mr-3 text-muted', classNames?.separator)}
            >
              /
            </span>
          )}
          <span
            aria-hidden="true"
            className={cn(
              'grid size-5 shrink-0 place-items-center rounded-full text-[10px]',
              index < current
                ? 'bg-accent text-on-brand'
                : index === current
                  ? 'bg-accent text-on-brand'
                  : 'border border-line',
              classNames?.indicator,
            )}
          >
            {index < current ? (
              <KitIcon
                name="check"
                builtin={{ outline: CheckIcon, bold: CheckBoldIcon }}
                size={12}
              />
            ) : (
              index + 1
            )}
          </span>
          <span className={classNames?.label}>{step.label}</span>
          {index < current && <span className="sr-only">{t('stepper.completed')}</span>}
        </li>
      ))}
    </ol>
  );
}
