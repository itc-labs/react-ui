'use client';

import { partTestId } from '../common/testing';
import { useUILocale } from '../../i18n/provider';
import { hasCompositionProp, overlayTrigger } from '../common/overlay-composition';
import { useComposedRefs } from '../common/refs';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { Popover as Primitive } from 'radix-ui';
import { cn } from '../common';
import { OverlayContainerContext, InlineSelectContext } from '../common/overlay';

type PopoverRootProps = ComponentProps<typeof Primitive.Root>;
export type PopoverProps =
  | (PopoverRootProps & { trigger?: never; content?: never })
  | (Omit<PopoverRootProps, 'children'> & {
      trigger: ReactNode;
      triggerAsChild?: boolean;
      triggerLabel?: string;
      triggerDisabled?: boolean;
      content: NonNullable<ReactNode>;
      label?: string;
      className?: string;
      classNames?: { content?: string; trigger?: string };
      'data-testid'?: string;
      contentProps?: Omit<
        ComponentProps<typeof PopoverContent>,
        'children' | 'className'
      >;
    });

export function Popover(props: PopoverProps) {
  const { t } = useUILocale();
  if (!hasCompositionProp(props, 'content')) return <Primitive.Root {...props} />;
  const {
    trigger,
    triggerAsChild,
    triggerLabel,
    triggerDisabled,
    content,
    label,
    className,
    classNames,
    'data-testid': testId,
    contentProps,
    ...rootProps
  } = props;

  return (
    <Primitive.Root {...rootProps}>
      <Primitive.Trigger asChild data-testid={partTestId(testId, 'trigger')}>
        {overlayTrigger(trigger, classNames?.trigger, {
          asChild: triggerAsChild,
          label: triggerLabel,
          disabled: triggerDisabled,
        })}
      </Primitive.Trigger>
      <PopoverContent
        aria-label={label ?? t('popover.label')}
        {...contentProps}
        data-testid={contentProps?.['data-testid'] ?? testId}
        className={cn(classNames?.content, className)}
      >
        {content}
      </PopoverContent>
    </Primitive.Root>
  );
}

export const PopoverTrigger = Primitive.Trigger;
export const PopoverClose = Primitive.Close;

export function PopoverContent({
  'data-testid': testId,
  className,
  children,
  ref,
  ...props
}: ComponentProps<typeof Primitive.Content> & { 'data-testid'?: string | undefined }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const composedRef = useComposedRefs(setContainer, ref);

  return (
    <Primitive.Portal>
      <Primitive.Content
        data-testid={testId}
        sideOffset={6}
        {...props}
        ref={composedRef}
        className={cn(
          'ui-floating-motion z-[var(--z-index-popover)] max-h-[var(--radix-popover-content-available-height)] w-[var(--container-popover)] max-w-[calc(100vw-2rem)] overflow-visible rounded-panel border border-line bg-surface p-4 text-control text-ink shadow-floating focus:outline-none',
          className,
        )}
      >
        <OverlayContainerContext.Provider value={container}>
          <InlineSelectContext.Provider value={true}>
            {children}
          </InlineSelectContext.Provider>
        </OverlayContainerContext.Provider>
      </Primitive.Content>
    </Primitive.Portal>
  );
}
