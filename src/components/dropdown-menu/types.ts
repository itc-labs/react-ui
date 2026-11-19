import type { ComponentProps, ReactNode } from 'react';
import type { DropdownMenu as Primitive } from 'radix-ui';
import type { SlotClasses, TestIdProps } from '../common';
import type { IconGlyph, IconName } from '../icon';

export type DropdownMenuItemTone =
  'default' | 'brand' | 'info' | 'success' | 'warning' | 'danger';

interface MenuEntryBase {
  id: string;
  className?: string;
}
interface MenuSelectable extends MenuEntryBase {
  label: ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'dashed';
  icon?: IconName | IconGlyph;
  shortcut?: ReactNode;
  textValue?: string;
}
export type DropdownMenuEntry =
  | (MenuSelectable & {
      type?: 'item';
      tone?: DropdownMenuItemTone;
      href?: string;
      onSelect?: ComponentProps<typeof Primitive.Item>['onSelect'];
    })
  | (MenuSelectable & {
      type: 'checkbox';
      checked: boolean | 'indeterminate';
      onCheckedChange: (checked: boolean) => void;
      closeOnSelect?: boolean;
    })
  | (MenuEntryBase & { type: 'separator' })
  | (MenuEntryBase & { type: 'label'; label: ReactNode })
  | (MenuEntryBase & {
      type: 'group';
      label?: ReactNode;
      items: readonly DropdownMenuEntry[];
    })
  | (MenuSelectable & {
      type: 'submenu';
      tone?: DropdownMenuItemTone;
      items: readonly DropdownMenuEntry[];
    });

export type DropdownMenuClassNames = SlotClasses<
  | 'header'
  | 'content'
  | 'trigger'
  | 'item'
  | 'itemLabel'
  | 'label'
  | 'separator'
  | 'icon'
  | 'shortcut'
  | 'checkboxIndicator'
  | 'checkboxIcon'
  | 'submenuTrigger'
  | 'submenuContent'
>;
type RootProps = ComponentProps<typeof Primitive.Root>;
export type DropdownMenuProps =
  | (RootProps & { items?: never; trigger?: never })
  | (Omit<RootProps, 'children'> & {
      trigger: ReactNode;
      header?: ReactNode;
      triggerAsChild?: boolean;
      triggerLabel?: string;
      triggerDisabled?: boolean;
      items: readonly DropdownMenuEntry[];
      className?: string;
      classNames?: DropdownMenuClassNames;
      'data-testid'?: string;
      contentProps?: Omit<
        ComponentProps<typeof Primitive.Content>,
        'children' | 'className'
      > &
        TestIdProps;
    });
