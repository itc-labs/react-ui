'use client';
import { partTestId } from '../common/testing';
import { overlayTrigger } from '../common/overlay-composition';

import type { ComponentProps, ReactElement, ReactNode } from 'react';
import { Tooltip as Primitive } from 'radix-ui';
import { type SlotClasses, cn } from '../common';

export type TooltipProps = {
  className?: string;
  classNames?: SlotClasses<'content' | 'arrow' | 'trigger'>;
  content: ReactNode;
  side?: ComponentProps<typeof Primitive.Content>['side'];
  triggerAsChild?: boolean;
  triggerLabel?: string;
  triggerDisabled?: boolean;
  'data-testid'?: string | undefined;
} & (
  | { trigger: Exclude<ReactNode, undefined>; children?: never }
  | { children: ReactElement; trigger?: never }
);

export function Tooltip({
  'data-testid': testId,
  children,
  trigger,
  triggerAsChild,
  triggerLabel,
  triggerDisabled,
  content,
  className,
  classNames,
  side = 'top',
}: TooltipProps) {
  return (
    <Primitive.Provider delayDuration={300}>
      <Primitive.Root>
        <Primitive.Trigger asChild data-testid={partTestId(testId, 'trigger')}>
          {trigger !== undefined
            ? overlayTrigger(trigger, classNames?.trigger, {
                asChild: triggerAsChild,
                label: triggerLabel,
                disabled: triggerDisabled,
              })
            : overlayTrigger(children, classNames?.trigger, {
                asChild: true,
                label: triggerLabel,
                disabled: triggerDisabled,
              })}
        </Primitive.Trigger>
        <Primitive.Portal>
          <Primitive.Content
            data-testid={testId}
            side={side}
            sideOffset={6}
            className={cn(
              'ui-floating-motion z-[var(--z-index-tooltip)] max-w-xs rounded-control bg-ink px-3 py-2 text-ui-sm text-surface shadow-floating',
              classNames?.content,
              className,
            )}
          >
            {content}
            <Primitive.Arrow
              data-testid={partTestId(testId, 'arrow')}
              className={cn('fill-ink', classNames?.arrow)}
            />
          </Primitive.Content>
        </Primitive.Portal>
      </Primitive.Root>
    </Primitive.Provider>
  );
}
