'use client';

import type { ComponentProps } from 'react';
import { DropdownMenu as Primitive } from 'radix-ui';
import { type SlotClasses, cn, partTestId } from '../common';
import { hasCompositionProp, overlayTrigger } from '../common/overlay-composition';
import { Icon } from '../icon';
import { menuContentClass, menuItemClass } from './classes';
import { MenuEntries } from './items';
import type { DropdownMenuProps } from './types';

export type {
  DropdownMenuProps,
  DropdownMenuEntry,
  DropdownMenuClassNames,
} from './types';

export function DropdownMenu(props: DropdownMenuProps) {
  if (!hasCompositionProp(props, 'items')) return <Primitive.Root {...props} />;
  const {
    items,
    trigger,
    triggerAsChild,
    triggerLabel,
    triggerDisabled,
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
      <DropdownMenuContent
        {...contentProps}
        data-testid={contentProps?.['data-testid'] ?? testId}
        className={cn(classNames?.content, className)}
      >
        <MenuEntries items={items} testId={testId} classNames={classNames} />
      </DropdownMenuContent>
    </Primitive.Root>
  );
}

export const DropdownMenuTrigger = Primitive.Trigger;

export function DropdownMenuContent({
  'data-testid': testId,
  className,
  ...props
}: ComponentProps<typeof Primitive.Content> & { 'data-testid'?: string | undefined }) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        data-testid={testId}
        sideOffset={6}
        collisionPadding={8}
        {...props}
        className={cn(menuContentClass, className)}
      />
    </Primitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof Primitive.Item>) {
  return (
    <Primitive.Item {...props} className={cn('relative', menuItemClass, className)} />
  );
}

export function DropdownMenuCheckboxItem({
  className,
  classNames,
  children,
  ...props
}: ComponentProps<typeof Primitive.CheckboxItem> & {
  classNames?: SlotClasses<'item' | 'indicator' | 'icon'>;
}) {
  return (
    <Primitive.CheckboxItem
      {...props}
      className={cn('relative', menuItemClass, 'pl-8', classNames?.item, className)}
    >
      <span className={cn('absolute left-2', classNames?.indicator)}>
        <Primitive.ItemIndicator>
          <Icon className={classNames?.icon} name="check" size={14} />
        </Primitive.ItemIndicator>
      </span>
      {children}
    </Primitive.CheckboxItem>
  );
}

export function DropdownMenuSeparator(
  props: ComponentProps<typeof Primitive.Separator>,
) {
  return (
    <Primitive.Separator
      {...props}
      className={cn('my-1 h-px bg-line', props.className)}
    />
  );
}

export function DropdownMenuLabel(props: ComponentProps<typeof Primitive.Label>) {
  return (
    <Primitive.Label
      {...props}
      className={cn('px-3 py-2 text-ui-sm font-semibold text-muted', props.className)}
    />
  );
}
