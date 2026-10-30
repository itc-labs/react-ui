'use client';

import { KitIcon } from '../icon/kit-icon';
import { ChevronDownIcon } from '../icon/outline/chevron-down';
import { ChevronDownIcon as ChevronDownBoldIcon } from '../icon/bold/chevron-down';

import { useContext } from 'react';
import { Accordion as Primitive } from 'radix-ui';
import { cn, partTestId } from '../common';
import { AccordionContext, AccordionItemContext, useAccordion } from './context';
import type {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
  AccordionVariant,
} from './types';

export type {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
  AccordionVariant,
  AccordionClassNames,
  AccordionItemData,
} from './types';

const roots: Record<AccordionVariant, string> = {
  divided: 'divide-y divide-line',
  bordered: 'divide-y divide-line rounded-panel border border-line bg-surface',
  separated: 'gap-3',
};

export function Accordion({
  variant = 'divided',
  items,
  children,
  className,
  classNames,
  'data-testid': testId,
  ...props
}: AccordionProps) {
  return (
    <AccordionContext.Provider value={{ variant, classNames, testId }}>
      <Primitive.Root
        {...props}
        data-testid={testId}
        className={cn('grid min-w-0', roots[variant], classNames?.root, className)}
      >
        {items
          ? items.map((item) => (
              <AccordionItem
                key={item.value}
                value={item.value}
                {...(item.disabled === undefined ? {} : { disabled: item.disabled })}
              >
                <AccordionTrigger>{item.trigger}</AccordionTrigger>
                <AccordionContent>{item.content}</AccordionContent>
              </AccordionItem>
            ))
          : children}
      </Primitive.Root>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  className,
  'data-testid': testId,
  ...props
}: AccordionItemProps) {
  const context = useAccordion();

  return (
    <AccordionItemContext.Provider value={value}>
      <Primitive.Item
        {...props}
        value={value}
        data-testid={testId ?? partTestId(context.testId, 'item', value)}
        className={cn(
          'min-w-0',
          context.variant === 'separated' &&
            'rounded-panel border border-line bg-surface',
          context.classNames?.item,
          className,
        )}
      />
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({
  children,
  className,
  classNames,
  headingLevel = 3,
  'data-testid': testId,
  ...props
}: AccordionTriggerProps) {
  const context = useAccordion();
  const value = useContext(AccordionItemContext);
  if (value === null) throw new Error('AccordionTrigger requires AccordionItem.');
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return (
    <Primitive.Header asChild>
      <Heading
        data-testid={partTestId(context.testId, 'header', value)}
        className={cn('flex', context.classNames?.header, classNames?.header)}
      >
        <Primitive.Trigger
          {...props}
          data-testid={testId ?? partTestId(context.testId, 'trigger', value)}
          className={cn(
            'group flex min-w-0 flex-1 items-center justify-between gap-4 rounded-control py-4 text-left text-control font-semibold text-ink outline-none motion-safe:transition-colors hover:text-accent focus-visible:shadow-control-focus disabled:cursor-not-allowed disabled:opacity-50',
            context.variant !== 'divided' && 'px-5',
            context.classNames?.trigger,
            classNames?.trigger,
            className,
          )}
        >
          {children}
          <KitIcon
            name="chevronDown"
            builtin={{ outline: ChevronDownIcon, bold: ChevronDownBoldIcon }}
            data-testid={partTestId(context.testId, 'icon', value)}
            className={cn(
              'size-4 shrink-0 text-muted motion-safe:transition-transform duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-standard)] group-data-[state=open]:rotate-180',
              context.classNames?.icon,
              classNames?.icon,
            )}
          />
        </Primitive.Trigger>
      </Heading>
    </Primitive.Header>
  );
}

export function AccordionContent({
  children,
  className,
  classNames,
  'data-testid': testId,
  ...props
}: AccordionContentProps) {
  const context = useAccordion();
  const value = useContext(AccordionItemContext);
  if (value === null) throw new Error('AccordionContent requires AccordionItem.');

  return (
    <Primitive.Content
      {...props}
      data-testid={testId ?? partTestId(context.testId, 'content', value)}
      className={cn(
        'overflow-hidden text-control text-muted motion-safe:data-[state=open]:animate-accordion-open motion-safe:data-[state=closed]:animate-accordion-close',
        context.classNames?.content,
        classNames?.content,
        className,
      )}
    >
      <div
        data-testid={partTestId(context.testId, 'body', value)}
        className={cn(
          'pb-4',
          context.variant !== 'divided' && 'px-5',
          context.classNames?.body,
          classNames?.body,
        )}
      >
        {children}
      </div>
    </Primitive.Content>
  );
}
