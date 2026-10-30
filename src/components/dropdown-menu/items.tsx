'use client';

import { KitIcon } from '../icon/kit-icon';
import { ChevronRightIcon } from '../icon/outline/chevron-right';
import { ChevronRightIcon as ChevronRightBoldIcon } from '../icon/bold/chevron-right';

import { DropdownMenu as Primitive } from 'radix-ui';
import { cn, partTestId } from '../common';
import { Icon } from '../icon';
import { UiLink } from '../link-image-provider';
import {
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './index';
import { dangerMenuItemClass, menuContentClass, menuItemClass } from './classes';
import type { DropdownMenuClassNames, DropdownMenuEntry } from './types';

export function MenuEntries({
  items,
  testId,
  classNames,
}: {
  items: readonly DropdownMenuEntry[];
  testId?: string | undefined;
  classNames?: DropdownMenuClassNames | undefined;
}) {
  return items.map((item) => {
    const id = partTestId(testId, item.type ?? 'item', item.id);
    if (item.type === 'separator')
      return (
        <DropdownMenuSeparator
          key={item.id}
          data-testid={id}
          className={cn(classNames?.separator, item.className)}
        />
      );
    if (item.type === 'label')
      return (
        <DropdownMenuLabel
          key={item.id}
          data-testid={id}
          className={cn(classNames?.label, item.className)}
        >
          {item.label}
        </DropdownMenuLabel>
      );
    if (item.type === 'group')
      return (
        <Primitive.Group key={item.id} data-testid={id} className={cn(item.className)}>
          {item.label != null && (
            <DropdownMenuLabel className={classNames?.label}>
              {item.label}
            </DropdownMenuLabel>
          )}
          <MenuEntries items={item.items} testId={id} classNames={classNames} />
        </Primitive.Group>
      );
    const content = (
      <>
        {item.icon && (
          <Icon name={item.icon} className={cn('size-4 shrink-0', classNames?.icon)} />
        )}
        <span className={cn('min-w-0 flex-1', classNames?.itemLabel)}>
          {item.label}
        </span>
        {item.shortcut != null && (
          <span
            className={cn('ml-auto pl-4 text-ui-sm text-muted', classNames?.shortcut)}
          >
            {item.shortcut}
          </span>
        )}
      </>
    );
    const shared = {
      ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
      ...(item.textValue === undefined ? {} : { textValue: item.textValue }),
      'data-testid': id,
      className: cn(
        item.type !== 'checkbox' && item.tone === 'danger' && dangerMenuItemClass,
        classNames?.item,
        item.className,
      ),
    };
    if (item.type === 'checkbox')
      return (
        <DropdownMenuCheckboxItem
          key={item.id}
          {...shared}
          checked={item.checked}
          onCheckedChange={item.onCheckedChange}
          onSelect={(event) => {
            if (item.closeOnSelect === false) event.preventDefault();
          }}
          classNames={{
            indicator: classNames?.checkboxIndicator ?? '',
            icon: classNames?.checkboxIcon ?? '',
          }}
        >
          {content}
        </DropdownMenuCheckboxItem>
      );
    if (item.type === 'submenu')
      return (
        <Primitive.Sub key={item.id}>
          <Primitive.SubTrigger
            {...shared}
            className={cn(menuItemClass, shared.className, classNames?.submenuTrigger)}
          >
            {content}
            <KitIcon
              name="chevronRight"
              builtin={{ outline: ChevronRightIcon, bold: ChevronRightBoldIcon }}
              className={cn('ml-auto size-4', classNames?.icon)}
            />
          </Primitive.SubTrigger>
          <Primitive.Portal>
            <Primitive.SubContent
              data-testid={partTestId(id, 'content')}
              sideOffset={6}
              collisionPadding={8}
              className={cn(menuContentClass, classNames?.submenuContent)}
            >
              <MenuEntries items={item.items} testId={id} classNames={classNames} />
            </Primitive.SubContent>
          </Primitive.Portal>
        </Primitive.Sub>
      );

    return (
      <DropdownMenuItem
        key={item.id}
        {...shared}
        {...(item.onSelect ? { onSelect: item.onSelect } : {})}
        {...(!item.disabled && item.href ? { asChild: true } : {})}
      >
        {!item.disabled && item.href ? (
          <UiLink href={item.href}>{content}</UiLink>
        ) : (
          content
        )}
      </DropdownMenuItem>
    );
  });
}
