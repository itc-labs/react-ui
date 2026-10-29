'use client';

import { createContext, useContext } from 'react';
import type { AccordionVariant, AccordionClassNames } from './types';

export const AccordionContext = createContext<{
  variant: AccordionVariant;
  classNames?: AccordionClassNames | undefined;
  testId?: string | undefined;
} | null>(null);
export const AccordionItemContext = createContext<string | null>(null);

export function useAccordion() {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('Accordion parts require Accordion.');

  return context;
}
