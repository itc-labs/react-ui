import type { ComponentProps, ReactNode } from 'react';
import type { Accordion as Primitive } from 'radix-ui';
import type { SlotClasses, TestIdProps } from '../common';

export type AccordionVariant = 'divided' | 'bordered' | 'separated';
export type AccordionClassNames = SlotClasses<
  'root' | 'item' | 'header' | 'trigger' | 'icon' | 'content' | 'body'
>;
export interface AccordionItemData {
  value: string;
  trigger: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export type AccordionProps = ComponentProps<typeof Primitive.Root> &
  TestIdProps & {
    variant?: AccordionVariant;
    items?: readonly AccordionItemData[];
    classNames?: AccordionClassNames;
  };
export type AccordionItemProps = ComponentProps<typeof Primitive.Item> & TestIdProps;
export type AccordionTriggerProps = Omit<
  ComponentProps<typeof Primitive.Trigger>,
  'asChild'
> &
  TestIdProps & {
    headingLevel?: 2 | 3 | 4 | 5 | 6;
    classNames?: Pick<AccordionClassNames, 'header' | 'trigger' | 'icon'>;
  };
export type AccordionContentProps = Omit<
  ComponentProps<typeof Primitive.Content>,
  'asChild'
> &
  TestIdProps & {
    classNames?: Pick<AccordionClassNames, 'content' | 'body'>;
  };
