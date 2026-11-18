'use client';
import type { ComponentProps, ReactNode } from 'react';
import { useUILocale } from '../../i18n/provider';
import { cn, partTestId, type SlotClasses, type TestIdProps } from '../common';

export type DescriptionListItem = {
  /** Stable key, also used for the item's part test ID. */
  id: string;
  label: ReactNode;
  /** `null`, `undefined` and `''` render the empty value; `0` and `false`-like content render as given. */
  value?: ReactNode;
  /** Spans every column in a multi-column list. */
  span?: 'full';
};
export type DescriptionListClassNames = SlotClasses<
  'root' | 'item' | 'label' | 'value'
>;
export type DescriptionListProps = Omit<ComponentProps<'dl'>, 'children'> &
  TestIdProps & {
    items: DescriptionListItem[];
    /** Columns from the `sm` breakpoint; one column below it. */
    columns?: 1 | 2 | 3;
    /** `stacked` puts the label above the value; `inline` puts it beside the value from `sm`. */
    layout?: 'stacked' | 'inline';
    size?: 'sm' | 'md';
    /** Replaces the default visual dash and localized spoken "Not set" text. */
    emptyValue?: ReactNode;
    classNames?: DescriptionListClassNames;
  };

const columnClassName = {
  1: '',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
} as const;
const spanClassName = {
  1: '',
  2: 'sm:col-span-2',
  3: 'sm:col-span-2 lg:col-span-3',
} as const;

function isEmpty(value: ReactNode) {
  return value === null || value === undefined || value === '';
}

/** Displays read-only label/value pairs using native description list semantics. */
export function DescriptionList({
  items,
  columns = 1,
  layout = 'stacked',
  size = 'md',
  emptyValue,
  className,
  classNames,
  'data-testid': testId,
  ...props
}: DescriptionListProps) {
  const { t } = useUILocale();
  const inline = layout === 'inline';
  const fallback = emptyValue ?? (
    <>
      <span aria-hidden="true">—</span>
      <span className="sr-only">{t('descriptionList.empty')}</span>
    </>
  );

  return (
    <dl
      {...props}
      data-testid={testId}
      data-layout={layout}
      className={cn(
        'grid grid-cols-1 gap-x-6',
        size === 'sm' ? 'gap-y-2 text-ui-sm' : 'gap-y-4 text-body',
        columnClassName[columns],
        classNames?.root,
        className,
      )}
    >
      {items.map((item) => {
        const empty = isEmpty(item.value);

        return (
          <div
            key={item.id}
            data-testid={partTestId(testId, 'item', item.id)}
            className={cn(
              'grid min-w-0 gap-1',
              inline &&
                'sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:items-baseline sm:gap-3',
              item.span === 'full' && spanClassName[columns],
              classNames?.item,
            )}
          >
            <dt
              data-testid={partTestId(testId, 'label', item.id)}
              className={cn('text-ui-sm text-muted', classNames?.label)}
            >
              {item.label}
            </dt>
            <dd
              data-testid={partTestId(testId, 'value', item.id)}
              data-empty={empty || undefined}
              className={cn(
                'm-0 min-w-0 whitespace-pre-wrap break-words text-ink',
                empty && 'text-muted',
                classNames?.value,
              )}
            >
              {empty ? fallback : item.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
