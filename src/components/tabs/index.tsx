'use client';

import { cn, partTestId, type SlotClasses } from '../common';
import { focusRingClassName } from '../common/focus-ring';
import { useUILocale } from '../../i18n/provider';
import type { TestIdProps } from '../common/testing';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { Tabs as Primitive } from 'radix-ui';

export type TabsVariant = 'segmented' | 'underline' | 'pills' | 'outline';
export interface TabsItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  keepMounted?: boolean;
}
export type TabsClassNames = SlotClasses<'root' | 'list' | 'trigger' | 'content'>;
type TabsSize = 'sm' | 'md' | 'lg';
type TabsContextValue = {
  value: string;
  classNames?: TabsClassNames | undefined;
  keepMounted: boolean;
  variant: TabsVariant;
  size: TabsSize;
  orientation: 'horizontal' | 'vertical';
};
const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs parts require Tabs.');

  return context;
}

export type TabsProps = (ComponentProps<typeof Primitive.Root> & {
  variant?: TabsVariant;
  size?: TabsSize;
  keepMounted?: boolean;
  items?: readonly TabsItem[];
  label?: string;
  classNames?: TabsClassNames;
}) &
  TestIdProps;

export function Tabs({
  items,
  label,
  classNames,
  'data-testid': testId,
  value: controlled,
  defaultValue = items?.find((item) => !item.disabled)?.value ?? '',
  onValueChange,
  variant = 'segmented',
  size = 'md',
  keepMounted = true,
  orientation = 'horizontal',
  className,
  children,
  ...props
}: TabsProps) {
  const { t } = useUILocale();
  const [local, setLocal] = useState(defaultValue);
  const value = controlled ?? local;
  const context = useMemo(
    () => ({ value, variant, size, keepMounted, orientation, classNames }),
    [value, variant, size, keepMounted, orientation, classNames],
  );

  return (
    <TabsContext.Provider value={context}>
      <Primitive.Root
        {...props}
        data-testid={testId}
        value={value}
        orientation={orientation}
        onValueChange={(next) => {
          if (controlled === undefined) setLocal(next);
          onValueChange?.(next);
        }}
        className={cn(
          'min-w-0',
          orientation === 'vertical' && 'flex items-start gap-6',
          classNames?.root,
          className,
        )}
      >
        {items ? (
          <>
            <TabsList
              aria-label={label ?? t('tabs.label')}
              data-testid={partTestId(testId, 'list')}
            >
              {items.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  {...(item.disabled === undefined ? {} : { disabled: item.disabled })}
                  data-testid={partTestId(testId, 'trigger', item.value)}
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {items.map((item) => (
              <TabsContent
                key={item.value}
                value={item.value}
                {...(item.keepMounted === undefined
                  ? {}
                  : { keepMounted: item.keepMounted })}
                className={cn(
                  'rounded-control border border-line p-4',
                  classNames?.content,
                )}
                data-testid={partTestId(testId, 'content', item.value)}
              >
                {item.content}
              </TabsContent>
            ))}
          </>
        ) : (
          children
        )}
      </Primitive.Root>
    </TabsContext.Provider>
  );
}

const lists: Record<TabsVariant, string> = {
  segmented: 'gap-1 rounded-control bg-sidebar p-1',
  underline: 'gap-5 border-b border-line',
  pills: 'gap-2',
  outline: 'gap-1 rounded-control border border-line bg-surface p-1',
};
const triggers: Record<TabsVariant, string> = {
  segmented:
    'rounded-control text-muted hover:text-ink data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-panel',
  underline:
    'rounded-t border-b-2 border-transparent px-0 text-muted hover:text-ink data-[state=active]:border-accent data-[state=active]:text-accent',
  pills:
    'rounded-full text-muted hover:bg-hover data-[state=active]:bg-accent data-[state=active]:text-on-brand',
  outline:
    'rounded-control text-muted hover:bg-hover data-[state=active]:bg-hover data-[state=active]:text-accent',
};

export function TabsList({
  className,
  ...props
}: ComponentProps<typeof Primitive.List>) {
  const { variant, orientation, classNames } = useTabs();

  return (
    <Primitive.List
      {...props}
      className={cn(
        'flex max-w-full overflow-x-auto',
        lists[variant],
        orientation === 'vertical'
          ? 'shrink-0 flex-col items-stretch'
          : 'w-fit items-center',
        variant === 'underline' &&
          orientation === 'vertical' &&
          'gap-1 border-b-0 border-r',
        classNames?.list,
        className,
      )}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof Primitive.Trigger>) {
  const { variant, size, orientation, classNames } = useTabs();

  return (
    <Primitive.Trigger
      {...props}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap px-3 font-medium transition-colors focus-visible:-outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40',
        focusRingClassName,
        size === 'sm'
          ? 'min-h-8 text-ui-sm'
          : size === 'lg'
            ? 'min-h-12 px-4 text-body'
            : 'min-h-10 text-control',
        triggers[variant],
        variant === 'underline' &&
          orientation === 'vertical' &&
          'justify-start rounded-none border-b-0 border-r-2 px-3 data-[state=active]:border-r-accent',
        classNames?.trigger,
        className,
      )}
    />
  );
}

export function TabsContent({
  className,
  value,
  keepMounted: override,
  forceMount,
  children,
  ...props
}: ComponentProps<typeof Primitive.Content> & { keepMounted?: boolean }) {
  const context = useTabs();
  const active = context.value === value;
  const [visited, setVisited] = useState(active);

  useEffect(() => {
    if (active) setVisited(true);
  }, [active]);

  // Radix owns IDs, roles and keyboard. Force-mount only visited panels by default.
  const retain = forceMount || ((override ?? context.keepMounted) && visited);

  return (
    <Primitive.Content
      {...props}
      value={value}
      {...(retain ? { forceMount: true } : {})}
      hidden={!active}
      inert={!active}
      className={cn(
        'min-w-0 data-[state=inactive]:hidden',
        focusRingClassName,
        context.orientation === 'vertical' ? 'flex-1' : 'mt-4',
        context.classNames?.content,
        className,
      )}
    >
      {children}
    </Primitive.Content>
  );
}
