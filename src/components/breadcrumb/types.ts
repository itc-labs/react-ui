import type { ComponentProps, MouseEventHandler, ReactNode } from 'react';
import type { SlotClasses } from '../common';

export interface BreadcrumbItemData {
  /** Stable identity, independent of translated titles and order. */
  key: string | number;
  title: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
}

export type BreadcrumbProps = ComponentProps<'nav'> & {
  items?: readonly BreadcrumbItemData[];
  description?: ReactNode;
  separator?: ReactNode;
  variant?: 'page' | 'hero';
  classNames?: SlotClasses<
    'root' | 'list' | 'item' | 'link' | 'current' | 'separator' | 'description'
  >;
  'data-testid'?: string;
};
