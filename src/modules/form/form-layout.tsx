'use client';
import {
  createContext,
  useContext,
  useId,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { cn, type SlotClasses } from '../../components/common';
import { partTestId, type TestIdProps } from '../../components/common/testing';

export type FormLayoutSize = 'sm' | 'md' | 'lg' | 'full';

export type FormLayoutProps = ComponentProps<'div'> &
  TestIdProps & {
    /** Maximum readable width. `full` fills the available width. */
    size?: FormLayoutSize;
    /** Horizontal placement when the container is wider than `size`. */
    align?: 'start' | 'center';
  };

const layoutSizes: Record<FormLayoutSize, string> = {
  sm: 'max-w-xl',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  full: 'max-w-none',
};

/** Readable-width column that stacks sections and the action bar of one form. */
export function FormLayout({
  size = 'md',
  align = 'start',
  className,
  ...props
}: FormLayoutProps) {
  return (
    <div
      {...props}
      data-size={size}
      className={cn(
        'grid w-full min-w-0 gap-6',
        layoutSizes[size],
        align === 'center' && 'mx-auto',
        className,
      )}
    />
  );
}

type FormSectionHeading = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

type FormSectionBaseProps = TestIdProps & {
  title?: ReactNode;
  description?: ReactNode;
  /** Header slot aligned to the end of the title, e.g. a link or small button. */
  action?: ReactNode;
  /** Heading element for the title. Visual style stays the same. */
  titleAs?: FormSectionHeading;
  /** `plain` adds no chrome; `card` renders a surface panel. */
  variant?: 'plain' | 'card';
  children?: ReactNode;
  classNames?: SlotClasses<'root' | 'title' | 'description' | 'action' | 'body'>;
};

export type FormSectionProps = FormSectionBaseProps &
  (
    | ({ asFieldset?: false } & Omit<ComponentProps<'section'>, 'title' | 'children'>)
    | ({ asFieldset: true } & Omit<ComponentProps<'fieldset'>, 'title' | 'children'>)
  );

const sectionVariants = {
  plain: '',
  card: 'rounded-panel border border-line bg-surface p-4 shadow-panel sm:p-6',
};

/**
 * Group related fields under an optional title. Renders a `<section>` labelled by
 * its title, or a `<fieldset>` named by a `<legend>` when `asFieldset` is set.
 */
export function FormSection(props: FormSectionProps) {
  const generated = useId();
  const {
    title,
    description,
    action,
    titleAs: Heading = 'h2',
    variant = 'plain',
    asFieldset,
    className,
    classNames,
    children,
    'data-testid': testId,
    ...rest
  } = props;
  const titleId = `${generated}-title`;
  const descriptionId = `${generated}-description`;
  const hasTitle = title != null && title !== false;
  const hasDescription = description != null && description !== false;
  const hasAction = action != null && action !== false;
  const hasHeader = hasTitle || hasDescription || hasAction;
  // The fieldset legend must be a direct child, so the header parts share one flat grid.
  const rootClassName = cn(
    'm-0 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] border-0 p-0',
    hasAction && 'gap-x-4',
    sectionVariants[variant],
    classNames?.root,
    className,
  );
  const titleClassName = cn(
    'col-start-1 text-section font-semibold text-ink',
    classNames?.title,
  );
  const content = (
    <>
      {hasDescription && (
        <p
          id={descriptionId}
          data-testid={partTestId(testId, 'description')}
          className={cn(
            'col-start-1 text-ui-sm text-muted',
            hasTitle && 'mt-1',
            classNames?.description,
          )}
        >
          {description}
        </p>
      )}
      {hasAction && (
        <div
          data-testid={partTestId(testId, 'action')}
          className={cn(
            'col-start-2 row-span-2 row-start-1 flex items-center gap-2 self-start',
            classNames?.action,
          )}
        >
          {action}
        </div>
      )}
      <div
        data-testid={partTestId(testId, 'body')}
        className={cn(
          'col-span-full grid min-w-0 gap-5',
          hasHeader && 'mt-5',
          classNames?.body,
        )}
      >
        {children}
      </div>
    </>
  );
  const describedBy = hasDescription ? descriptionId : undefined;

  if (asFieldset) {
    const fieldsetProps = rest as Omit<
      ComponentProps<'fieldset'>,
      'title' | 'children'
    >;

    return (
      <fieldset
        aria-describedby={describedBy}
        {...fieldsetProps}
        data-testid={testId}
        data-variant={variant}
        className={rootClassName}
      >
        {hasTitle && (
          // A floated legend is laid out as an ordinary grid item instead of the border.
          <legend
            data-testid={partTestId(testId, 'title')}
            className={cn('float-left w-full p-0', titleClassName)}
          >
            {title}
          </legend>
        )}
        {content}
      </fieldset>
    );
  }

  return (
    <section
      aria-labelledby={hasTitle ? titleId : undefined}
      aria-describedby={describedBy}
      {...rest}
      data-testid={testId}
      data-variant={variant}
      className={rootClassName}
    >
      {hasTitle && (
        <Heading
          id={titleId}
          data-testid={partTestId(testId, 'title')}
          className={titleClassName}
        >
          {title}
        </Heading>
      )}
      {content}
    </section>
  );
}

export type FormGridColumns = 1 | 2 | 3 | 4;
export type FormGridSpan = 1 | 2 | 3 | 4 | 'full';

export type FormGridProps = ComponentProps<'div'> &
  TestIdProps & {
    /** Maximum columns on wide containers. Narrow containers always use one column. */
    columns?: FormGridColumns;
    classNames?: SlotClasses<'root' | 'grid'>;
  };

type Breakpoint = '@lg' | '@3xl' | '@4xl';

// Column count reached at each container breakpoint for every `columns` value.
const columnSteps: Record<FormGridColumns, readonly (readonly [Breakpoint, number])[]> =
  {
    1: [],
    2: [['@lg', 2]],
    3: [
      ['@lg', 2],
      ['@3xl', 3],
    ],
    4: [
      ['@lg', 2],
      ['@4xl', 4],
    ],
  };

const columnClasses: Record<FormGridColumns, string> = {
  1: '',
  2: '@lg:grid-cols-2',
  3: '@lg:grid-cols-2 @3xl:grid-cols-3',
  4: '@lg:grid-cols-2 @4xl:grid-cols-4',
};

// Literal class names so Tailwind generates every combination used by FormGridItem.
const spanClasses: Record<Breakpoint, Record<number, string>> = {
  '@lg': { 2: '@lg:col-span-2' },
  '@3xl': { 2: '@3xl:col-span-2', 3: '@3xl:col-span-3' },
  '@4xl': { 2: '@4xl:col-span-2', 3: '@4xl:col-span-3', 4: '@4xl:col-span-4' },
};

const FormGridContext = createContext<FormGridColumns>(2);

/** Class names that make an item span `span` columns of a FormGrid with `columns`. */
function formGridSpanClassName(span: FormGridSpan, columns: FormGridColumns) {
  if (span === 'full') return 'col-span-full';

  return columnSteps[columns]
    .map(([breakpoint, count]) => spanClasses[breakpoint][Math.min(span, count)])
    .filter(Boolean)
    .join(' ');
}

/**
 * Responsive field grid driven by its own width (container queries): one column
 * on narrow containers, up to `columns` on wide ones. Fields align at the top.
 */
export function FormGrid({
  columns = 2,
  className,
  classNames,
  children,
  'data-testid': testId,
  ...props
}: FormGridProps) {
  const resolved = columnClasses[columns] === undefined ? 2 : columns;

  return (
    <div
      {...props}
      data-testid={testId}
      className={cn('@container min-w-0', classNames?.root, className)}
    >
      <div
        data-testid={partTestId(testId, 'grid')}
        data-columns={resolved}
        className={cn(
          'grid grid-cols-1 items-start gap-x-4 gap-y-5',
          columnClasses[resolved],
          classNames?.grid,
        )}
      >
        <FormGridContext.Provider value={resolved}>{children}</FormGridContext.Provider>
      </div>
    </div>
  );
}

export type FormGridItemProps = ComponentProps<'div'> &
  TestIdProps & {
    /** Columns to span, clamped to the columns available at the current width. */
    span?: FormGridSpan;
  };

/** Wrap a field that spans several FormGrid columns, e.g. notes with `span="full"`. */
export function FormGridItem({ span = 1, className, ...props }: FormGridItemProps) {
  const columns = useContext(FormGridContext);

  return (
    <div
      {...props}
      data-span={span}
      className={cn('min-w-0', formGridSpanClassName(span, columns), className)}
    />
  );
}

export type FormActionsProps = ComponentProps<'div'> &
  TestIdProps & {
    /** Secondary or navigation actions placed at the start, e.g. "Back to list". */
    start?: ReactNode;
    /** Stick to the bottom of the scroll container with a surface background. */
    sticky?: boolean;
    /** Draw a top border above a non-sticky action bar. */
    separator?: boolean;
    classNames?: SlotClasses<'root' | 'start' | 'end'>;
  };

/**
 * Form action bar. Children align to the end with the primary action last; `start`
 * holds secondary actions. Narrow containers stack full-width buttons, primary first.
 */
export function FormActions({
  start,
  sticky = false,
  separator = false,
  className,
  classNames,
  children,
  'data-testid': testId,
  ...props
}: FormActionsProps) {
  const group =
    'flex min-w-0 gap-2 *:w-full @md:flex-row @md:items-center @md:*:w-auto';

  return (
    <div
      {...props}
      data-testid={testId}
      data-sticky={sticky || undefined}
      className={cn(
        '@container w-full min-w-0',
        separator && !sticky && 'border-t border-line pt-4',
        sticky &&
          'sticky bottom-0 z-[var(--z-index-header)] border-t border-line bg-surface pt-3 pb-[max(--spacing(3),env(safe-area-inset-bottom))]',
        classNames?.root,
        className,
      )}
    >
      <div className="flex flex-col-reverse gap-2 @md:flex-row @md:items-center">
        {start != null && start !== false && (
          <div
            data-testid={partTestId(testId, 'start')}
            className={cn('flex-col', group, classNames?.start)}
          >
            {start}
          </div>
        )}
        <div
          data-testid={partTestId(testId, 'end')}
          className={cn('flex-col-reverse @md:ml-auto', group, classNames?.end)}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
