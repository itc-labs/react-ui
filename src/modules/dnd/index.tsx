'use client';

import {
  Children,
  cloneElement,
  createContext,
  createElement,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type Modifiers,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import { cn, partTestId } from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import { KitIcon } from '../../components/icon/kit-icon';
import { GripVerticalIcon } from '../../components/icon/outline/grip-vertical';
import { GripVerticalIcon as GripVerticalBoldIcon } from '../../components/icon/bold/grip-vertical';
import { useUILocale } from '../../i18n/provider';
import { OverlayPortal } from './overlay-portal';

export { useSortable as useSortableItem } from '@dnd-kit/sortable';
export type {
  DragStartEvent,
  DragEndEvent,
  DragCancelEvent,
  DragOverEvent,
} from '@dnd-kit/core';
export type UseSortableItemOptions = Parameters<typeof useSortable>[0];

export type DndProviderProps = ComponentPropsWithRef<typeof DndContext>;

/** Kit sensors and translated announcements; every DndContext option remains available. */
export function DndProvider({ accessibility, sensors, ...props }: DndProviderProps) {
  const { t } = useUILocale();
  const defaults = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const label = (entry: {
    id: string | number;
    data: { current: Record<string, unknown> | undefined };
  }) => String(entry.data.current?.label ?? entry.id);

  const announcements: Announcements = {
    onDragStart: ({ active }) => t('dnd.pickedUp', { label: label(active) }),
    onDragOver: ({ active, over }) =>
      active.id === over?.id
        ? undefined
        : over
          ? t('dnd.over', { label: label(active), target: label(over) })
          : t('dnd.outside', { label: label(active) }),
    onDragEnd: ({ active, over }) =>
      t(over ? 'dnd.dropped' : 'dnd.cancelled', {
        label: label(active),
        target: over ? label(over) : '',
      }),
    onDragCancel: ({ active }) => t('dnd.cancelled', { label: label(active) }),
  };

  return (
    <DndContext
      autoScroll
      collisionDetection={closestCenter}
      {...props}
      sensors={sensors ?? defaults}
      accessibility={{
        ...accessibility,
        announcements: { ...announcements, ...accessibility?.announcements },
        screenReaderInstructions: {
          draggable: t('dnd.instructions'),
          ...accessibility?.screenReaderInstructions,
        },
      }}
    />
  );
}

export interface DragHandleProps extends ComponentPropsWithRef<'button'> {
  label: string;
  classNames?: { root?: string; icon?: string };
  'data-testid'?: string | undefined;
}

export function DragHandle({
  label,
  className,
  classNames,
  children,
  'data-testid': testId,
  ...props
}: DragHandleProps) {
  const { t } = useUILocale();

  return (
    <button
      type="button"
      aria-label={t('dnd.handle', { label })}
      {...props}
      data-testid={testId}
      className={cn(
        'inline-flex size-8 shrink-0 touch-none items-center justify-center rounded-control text-ink-muted enabled:cursor-grab active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        focusRingClassName,
        classNames?.root,
        className,
      )}
    >
      {children ?? (
        <KitIcon
          name="gripVertical"
          builtin={{ outline: GripVerticalIcon, bold: GripVerticalBoldIcon }}
          aria-hidden="true"
          data-testid={partTestId(testId, 'icon')}
          className={cn('size-4', classNames?.icon)}
        />
      )}
    </button>
  );
}

export type SortableClassNames = Partial<
  Record<'root' | 'item' | 'itemDragging' | 'placeholder' | 'overlay' | 'empty', string>
>;
export type SortableOrientation = 'vertical' | 'horizontal' | 'grid';
export type SortableValue = Readonly<Record<string, readonly string[]>>;
export interface ReorderEvent {
  activeId: string;
  overId: string;
  from: number;
  to: number;
}
export interface MoveEvent extends ReorderEvent {
  fromContainer: string;
  toContainer: string;
}
export interface SortableItemState {
  isDragging: boolean;
  isOverlay: boolean;
}

const gaps = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  6: 'gap-6',
  8: 'gap-8',
};
const strategies = {
  vertical: verticalListSortingStrategy,
  horizontal: horizontalListSortingStrategy,
  grid: rectSortingStrategy,
};
const placeholderClassName =
  'bg-brand-50 text-transparent outline-2 -outline-offset-2 outline-brand-500 outline-dashed [&_*]:invisible';
const overlayClassName =
  'scale-[1.02] cursor-grabbing rounded-control bg-surface text-ink shadow-overlay ring-2 ring-brand-500';

function modifiersFor(restrict: boolean, axis: 'x' | 'y' | undefined): Modifiers {
  return [
    ...(restrict ? [restrictToParentElement] : []),
    ...(axis === 'x'
      ? [restrictToHorizontalAxis]
      : axis === 'y'
        ? [restrictToVerticalAxis]
        : []),
  ];
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => setReduced(query.matches);

    update();
    query.addEventListener('change', update);

    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}

type ElementProps = Record<string, unknown> & {
  className?: string | undefined;
  style?: CSSProperties | undefined;
  ref?: Ref<HTMLElement> | undefined;
};

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as { current: T | null }).current = node;
}

/** Merge kit props into a single child element for asChild, keeping the child's own handlers. */
function renderElement(
  asChild: boolean | undefined,
  props: ElementProps,
  children: ReactNode,
  /** Applied after the child's own classes, for state styling that must win. */
  stateClassName?: string | false,
) {
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<ElementProps>;
    const merged: ElementProps = { ...props, ...child.props };
    for (const key of Object.keys(props)) {
      const ours = props[key];
      const theirs = child.props[key];
      if (
        /^on[A-Z]/.test(key) &&
        typeof ours === 'function' &&
        typeof theirs === 'function'
      )
        merged[key] = (...args: unknown[]) => {
          (theirs as (...args: unknown[]) => void)(...args);
          (ours as (...args: unknown[]) => void)(...args);
        };
    }

    return cloneElement(child, {
      ...merged,
      className: cn(props.className, child.props.className, stateClassName),
      style: { ...child.props.style, ...props.style },
      ref: (node: HTMLElement | null) => {
        assignRef(props.ref, node);
        assignRef(child.props.ref, node);
      },
    });
  }

  return createElement(
    'div',
    { ...props, className: cn(props.className, stateClassName) },
    children,
  );
}

interface ItemRecord {
  label: string;
  asChild: boolean;
  className: string | undefined;
  children: SortableItemProps['children'];
  activator: HTMLElement | null;
}
interface EngineContextValue {
  shown: SortableValue;
  activeId: string | null;
  disabled: boolean;
  reduced: boolean;
  prefix: string;
  testId: string | undefined;
  classNames: SortableClassNames | undefined;
  items: Map<string, ItemRecord>;
  activeRef: { current: string | null };
  setOverlay: (render: ((id: string) => ReactNode) | null) => void;
}
const EngineContext = createContext<EngineContextValue | null>(null);
const ContainerContext = createContext<{
  id: string;
  testId: string | undefined;
} | null>(null);
interface ItemContextValue {
  id: string;
  label: string;
  disabled: boolean;
  overlay: boolean;
  sortable: ReturnType<typeof useSortable> | null;
  setHandle: (node: HTMLElement | null) => void;
}
const ItemContext = createContext<ItemContextValue | null>(null);

function containing(value: SortableValue, id: unknown) {
  return Object.keys(value).find((key) => value[key]!.includes(String(id)));
}

function useEngine(name: string) {
  const engine = useContext(EngineContext);
  if (!engine)
    throw new Error(`${name} must be rendered inside Sortable or SortableGroup.`);

  return engine;
}

interface EngineProps {
  value: SortableValue;
  onChange: (next: Record<string, string[]>, event: MoveEvent) => void;
  canDrop?: ((id: string, from: string, to: string) => boolean) | undefined;
  disabled: boolean;
  restrictToParent: boolean;
  lockAxis: 'x' | 'y' | undefined;
  classNames: SortableClassNames | undefined;
  testId: string | undefined;
  children: ReactNode;
}

/** Shared drag engine: previews cross-container moves and commits one change on drop. */
function SortableEngine({
  value,
  onChange,
  canDrop,
  disabled,
  restrictToParent,
  lockAxis,
  classNames,
  testId,
  children,
}: EngineProps) {
  const prefix = useId();
  const reduced = useReducedMotion();
  const items = useRef(new Map<string, ItemRecord>()).current;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Record<string, string[]> | null>(null);
  const [renderOverlay, setRenderOverlay] = useState<
    ((id: string) => ReactNode) | null
  >(null);
  const setOverlay = useCallback(
    (render: ((id: string) => ReactNode) | null) => setRenderOverlay(() => render),
    [],
  );
  const pendingFocus = useRef<string | null>(null);
  const activeRef = useRef<string | null>(null);
  const blocked = useRef(false);
  activeRef.current = activeId;
  const shown: SortableValue = preview ?? value;

  const allowed = (id: string, to: string) => {
    const from = containing(value, id);

    return from !== undefined && (!canDrop || canDrop(id, from, to));
  };

  useEffect(() => {
    if (activeId !== null || pendingFocus.current === null) return;
    items.get(pendingFocus.current)?.activator?.focus({ preventScroll: true });
    pendingFocus.current = null;
  });

  const finish = (id: string) => {
    pendingFocus.current = id;
    setPreview(null);
    setActiveId(null);
  };

  const over = ({ active, over }: DragOverEvent) => {
    // Hovering a container that refuses the item returns it to its origin.
    if (!over) return blocked.current ? setPreview(null) : undefined;
    if (disabled || over.id === active.id) return;

    setPreview((previous) => {
      const list: Record<string, string[]> = previous ?? {
        ...Object.fromEntries(
          Object.entries(value).map(([key, ids]) => [key, [...ids]]),
        ),
      };
      const id = String(active.id);
      const from = containing(list, id);
      const to = over.data.current?.containerId as string | undefined;
      if (!from || !to || from === to || !list[to] || !allowed(id, to)) return previous;
      const overIndex = list[to].indexOf(String(over.id));
      const translated = active.rect.current.translated;
      const below =
        overIndex >= 0 &&
        !!translated &&
        translated.top + translated.height / 2 > over.rect.top + over.rect.height / 2;
      const index = overIndex < 0 ? list[to].length : overIndex + (below ? 1 : 0);
      const target = list[to].filter((entry) => entry !== id);
      target.splice(index, 0, id);

      return {
        ...list,
        [from]: list[from]!.filter((entry) => entry !== id),
        [to]: target,
      };
    });
  };

  const end = ({ active, over }: DragEndEvent) => {
    const list = preview ?? value;
    const id = String(active.id);
    finish(id);
    if (disabled || !over) return;
    const origin = containing(value, id);
    const to = containing(list, id);
    if (!origin || !to || !allowed(id, to)) return;
    const from = value[origin]!.indexOf(id);
    const current = list[to]!.indexOf(id);
    const overIndex = list[to]!.indexOf(String(over.id));
    const ids =
      overIndex >= 0 && overIndex !== current
        ? arrayMove([...list[to]!], current, overIndex)
        : [...list[to]!];
    const index = ids.indexOf(id);
    if (to === origin && index === from) return;
    const next = Object.fromEntries(
      Object.entries(list).map(([key, entries]) => [
        key,
        key === to ? ids : [...entries],
      ]),
    );
    onChange(next, {
      activeId: id,
      overId: String(over.id),
      fromContainer: origin,
      toContainer: to,
      from,
      to: index,
    });
  };

  const record = activeId === null ? undefined : items.get(activeId);
  const overlayContent =
    activeId === null
      ? null
      : renderOverlay
        ? renderOverlay(activeId)
        : record && (
            <ItemContext.Provider
              value={{
                id: activeId,
                label: record.label,
                disabled: true,
                overlay: true,
                sortable: null,
                setHandle: () => {},
              }}
            >
              {typeof record.children === 'function'
                ? record.children({ isDragging: true, isOverlay: true })
                : record.children}
            </ItemContext.Provider>
          );

  return (
    <EngineContext.Provider
      value={{
        shown,
        activeId,
        disabled,
        reduced,
        prefix,
        testId,
        classNames,
        items,
        activeRef,
        setOverlay,
      }}
    >
      <DndProvider
        accessibility={{ restoreFocus: false }}
        modifiers={modifiersFor(restrictToParent, lockAxis)}
        collisionDetection={(args) => {
          const id = String(args.active.id);
          const candidates = args.droppableContainers.filter((entry) => {
            const container = entry.data.current?.containerId as string | undefined;

            return (
              container !== undefined && !!shown[container] && allowed(id, container)
            );
          });
          const columns = candidates.filter((entry) => entry.data.current?.isContainer);
          const pointer = args.pointerCoordinates;
          blocked.current = false;

          if (!pointer)
            // Keyboard: nearest item, or a container holding nothing but the dragged item.
            return closestCenter({
              ...args,
              droppableContainers: candidates.filter((entry) => {
                const container = entry.data.current?.containerId as string;

                return (
                  !entry.data.current?.isContainer ||
                  !shown[container]!.some((entry) => entry !== id)
                );
              }),
            });

          // Pointer: the container under the cursor wins, then its nearest item.
          const point = {
            ...args,
            collisionRect: {
              top: pointer.y,
              bottom: pointer.y,
              left: pointer.x,
              right: pointer.x,
              width: 0,
              height: 0,
            },
          };
          // A container that refuses the item blocks the drop instead of passing it on.
          const [hit] = pointerWithin({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (entry) => entry.data.current?.isContainer,
            ),
          });
          blocked.current = !!hit && !columns.some((entry) => entry.id === hit.id);
          if (blocked.current) return [];
          const [column] = hit
            ? [hit]
            : closestCenter({ ...point, droppableContainers: columns });
          if (!column) return [];
          const container = columns.find((entry) => entry.id === column.id)?.data
            .current?.containerId;
          const cards = candidates.filter(
            (entry) =>
              !entry.data.current?.isContainer &&
              entry.data.current?.containerId === container,
          );

          return cards.length
            ? closestCenter({ ...point, droppableContainers: cards })
            : [column];
        }}
        onDragStart={({ active }) => setActiveId(String(active.id))}
        onDragOver={over}
        onDragCancel={({ active }) => finish(String(active.id))}
        onDragEnd={end}
      >
        {children}
        <OverlayPortal>
          <DragOverlay dropAnimation={reduced ? null : undefined}>
            {overlayContent != null && (
              <div
                aria-hidden="true"
                inert
                data-testid={partTestId(testId, 'overlay')}
                className={cn(
                  !renderOverlay && overlayClassName,
                  !renderOverlay && record?.className,
                  classNames?.overlay,
                )}
              >
                {overlayContent}
              </div>
            )}
          </DragOverlay>
        </OverlayPortal>
      </DndProvider>
    </EngineContext.Provider>
  );
}

export interface SortableGroupProps {
  /** Item IDs per container, keyed by the `id` of each nested Sortable. IDs must be unique across the group. */
  value: SortableValue;
  onValueChange: (next: Record<string, string[]>, event: MoveEvent) => void;
  canDrop?: (id: string, from: string, to: string) => boolean;
  disabled?: boolean;
  restrictToParent?: boolean;
  lockAxis?: 'x' | 'y';
  classNames?: SortableClassNames;
  'data-testid'?: string;
  children: ReactNode;
}

/** Connects several Sortable containers so items can move between them. Renders no element. */
export function SortableGroup({
  value,
  onValueChange,
  canDrop,
  disabled = false,
  restrictToParent = false,
  lockAxis,
  classNames,
  'data-testid': testId,
  children,
}: SortableGroupProps) {
  return (
    <SortableEngine
      value={value}
      onChange={onValueChange}
      canDrop={canDrop}
      disabled={disabled}
      restrictToParent={restrictToParent}
      lockAxis={lockAxis}
      classNames={classNames}
      testId={testId}
    >
      {children}
    </SortableEngine>
  );
}

export interface SortableProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'onChange' | 'defaultValue'
> {
  /** Container ID inside SortableGroup; the group owns the value. */
  id?: string;
  /** Ordered item IDs for a standalone list. */
  value?: readonly string[];
  onValueChange?: (next: string[], event: ReorderEvent) => void;
  orientation?: SortableOrientation;
  gap?: 0 | 1 | 2 | 3 | 4 | 6 | 8;
  disabled?: boolean;
  restrictToParent?: boolean;
  lockAxis?: 'x' | 'y';
  /** Shown inside an empty container of a group. Pass null to hide it. */
  emptyContent?: ReactNode;
  asChild?: boolean;
  classNames?: SortableClassNames | undefined;
  'data-testid'?: string;
  children?: ReactNode;
}

const STANDALONE = 'list';

/** A sortable container. Standalone it owns a list; inside SortableGroup it is one column. */
export function Sortable({
  id,
  value,
  onValueChange,
  disabled = false,
  restrictToParent = false,
  lockAxis,
  classNames,
  ...props
}: SortableProps) {
  const engine = useContext(EngineContext);

  if (engine) {
    if (id === undefined)
      throw new Error('Sortable inside SortableGroup requires an id.');

    return (
      <SortableContainer
        {...props}
        id={id}
        classNames={classNames}
        disabled={disabled}
      />
    );
  }

  return (
    <SortableEngine
      value={{ [STANDALONE]: value ?? [] }}
      onChange={(next, event) =>
        onValueChange?.(next[STANDALONE]!, {
          activeId: event.activeId,
          overId: event.overId,
          from: event.from,
          to: event.to,
        })
      }
      disabled={disabled}
      restrictToParent={restrictToParent}
      lockAxis={lockAxis}
      classNames={classNames}
      testId={props['data-testid']}
    >
      <SortableContainer
        {...props}
        id={STANDALONE}
        standalone
        classNames={classNames}
        disabled={disabled}
      />
    </SortableEngine>
  );
}

function SortableContainer({
  id,
  standalone = false,
  orientation = 'vertical',
  gap = 2,
  disabled,
  emptyContent,
  asChild,
  className,
  classNames,
  'data-testid': testId,
  children,
  ref,
  ...props
}: Omit<SortableProps, 'value' | 'onValueChange' | 'restrictToParent' | 'lockAxis'> & {
  id: string;
  standalone?: boolean;
}) {
  const { t } = useUILocale();
  const engine = useEngine('Sortable');
  const ids = engine.shown[id] ?? [];
  const off = engine.disabled || Boolean(disabled);
  const label = props['aria-label'] ?? t(standalone ? 'dnd.list' : 'dnd.board');
  const { setNodeRef, isOver } = useDroppable({
    id: `${engine.prefix}-${id}`,
    disabled: off,
    data: { containerId: id, label, isContainer: true },
  });
  // Children are rendered in preview order so a dragged item appears in its target container.
  const byId = new Map<string, ReactNode>();
  const rest: ReactNode[] = [];
  // With asChild the items live inside the caller's element, such as a ul.
  const shell =
    asChild && isValidElement<{ children?: ReactNode }>(children) ? children : null;

  Children.forEach(shell ? shell.props.children : children, (child) => {
    if (isValidElement<{ id?: unknown }>(child) && typeof child.props.id === 'string')
      byId.set(child.props.id, child);
    else rest.push(child);
  });

  const external = (itemId: string) =>
    engine.activeId === itemId && !byId.has(itemId) ? (
      <SortableItem key={itemId} id={itemId}>
        {null}
      </SortableItem>
    ) : null;

  const content = (
    <SortableContext items={[...ids]} strategy={strategies[orientation]} disabled={off}>
      {ids.map(
        (itemId) => byId.get(itemId) ?? lookup(engine, itemId) ?? external(itemId),
      )}
      {rest}
      {!standalone && !ids.length && emptyContent !== null && (
        <div
          role="listitem"
          data-testid={partTestId(testId, 'empty')}
          className={cn(
            'rounded-control border border-dashed border-control-border p-4 text-ui-sm text-ink-muted',
            classNames?.empty,
          )}
        >
          {emptyContent ?? t('dnd.empty')}
        </div>
      )}
    </SortableContext>
  );

  return (
    <ContainerContext.Provider
      value={{ id, testId: testId ?? (standalone ? engine.testId : undefined) }}
    >
      {renderElement(
        asChild,
        {
          ...props,
          ref: (node: HTMLElement | null) => {
            setNodeRef(node);
            assignRef(ref as Ref<HTMLElement>, node);
          },
          role: props.role ?? 'list',
          'aria-label': label,
          'aria-disabled': off || undefined,
          'data-testid': testId,
          'data-over': (!standalone && isOver) || undefined,
          className: cn(
            orientation === 'grid' ? 'grid grid-cols-2' : 'flex',
            orientation === 'vertical' && 'flex-col',
            gaps[gap],
            !standalone &&
              'min-h-16 rounded-panel motion-safe:transition-colors data-[over]:bg-brand-50',
            classNames?.root,
            className,
          ),
        },
        shell ? cloneElement(shell, undefined, content) : content,
      )}
    </ContainerContext.Provider>
  );
}

/** While previewing a move, the dragged item is rendered by its target container from the registry. */
function lookup(engine: EngineContextValue, itemId: string) {
  const record = engine.items.get(itemId);
  if (!record || engine.activeId !== itemId) return null;

  return (
    <SortableItem
      key={itemId}
      id={itemId}
      label={record.label}
      asChild={record.asChild}
      className={record.className}
    >
      {record.children}
    </SortableItem>
  );
}

export interface SortableItemProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'id'
> {
  id: string;
  /** Readable name for announcements and the handle label. Defaults to the ID. */
  label?: string | undefined;
  disabled?: boolean;
  /** Merge sortable behavior into the single child element, such as an li or a card. */
  asChild?: boolean;
  'data-testid'?: string;
  children?: ReactNode | ((state: SortableItemState) => ReactNode);
}

/** Wrap any content to make it sortable. Without a SortableHandle the whole item drags. */
export function SortableItem({
  id,
  label,
  disabled = false,
  asChild = false,
  className,
  style,
  children,
  ref,
  'data-testid': testId,
  ...props
}: SortableItemProps) {
  const engine = useEngine('SortableItem');
  const container = useContext(ContainerContext);
  const [handle, setHandle] = useState<HTMLElement | null>(null);
  const name = label ?? id;
  const off = engine.disabled || disabled;
  const sortable = useSortable({
    id,
    disabled: off,
    data: { containerId: container?.id, label: name },
    ...(engine.reduced ? { transition: null } : {}),
  });
  const dragging = sortable.isDragging;
  const record = engine.items.get(id);

  if (record) {
    record.label = name;
    record.asChild = asChild;
    record.className = className;
    record.children = children;
  } else
    engine.items.set(id, {
      label: name,
      asChild,
      className,
      children,
      activator: null,
    });

  useEffect(() => {
    const entry = engine.items.get(id);
    if (entry) entry.activator = handle ?? entry.activator;
  });

  useEffect(
    () => () => {
      if (engine.activeRef.current !== id) engine.items.delete(id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  const { role: _role, ...attributes } = sortable.attributes;
  const whole = !handle;
  const element = renderElement(
    asChild,
    {
      ...props,
      ...(whole ? { ...attributes, ...sortable.listeners } : {}),
      ...(asChild ? {} : { role: 'listitem' }),
      tabIndex: whole ? (off ? -1 : 0) : props.tabIndex,
      'aria-disabled': whole && off ? true : undefined,
      ref: (node: HTMLElement | null) => {
        sortable.setNodeRef(node);
        if (whole) {
          sortable.setActivatorNodeRef(node);
          const entry = engine.items.get(id);
          if (entry && node) entry.activator = node;
        }
        assignRef(ref as Ref<HTMLElement>, node);
      },
      'data-dnd-item': id,
      'data-dnd-activator': whole ? '' : undefined,
      'data-dragging': dragging || undefined,
      'data-testid': testId ?? partTestId(container?.testId, 'item', id),
      style: {
        ...style,
        transform: CSS.Transform.toString(sortable.transform),
        transition: engine.reduced ? undefined : sortable.transition,
      },
      className: cn(
        'relative rounded-control motion-reduce:transition-none',
        whole && !off && 'touch-none cursor-grab active:cursor-grabbing',
        whole && focusRingClassName,
        engine.classNames?.item,
        className,
      ),
    },
    typeof children === 'function'
      ? children({ isDragging: dragging, isOverlay: false })
      : children,
    dragging &&
      cn(
        placeholderClassName,
        engine.classNames?.itemDragging,
        engine.classNames?.placeholder,
      ),
  );

  return (
    <ItemContext.Provider
      value={{ id, label: name, disabled: off, overlay: false, sortable, setHandle }}
    >
      {element}
    </ItemContext.Provider>
  );
}

export type SortableHandleProps = Omit<DragHandleProps, 'label'> & { label?: string };

/** Drag handle for the enclosing SortableItem; the rest of the item stays interactive. */
export function SortableHandle({ label, ref, ...props }: SortableHandleProps) {
  const item = useContext(ItemContext);
  if (!item) throw new Error('SortableHandle must be rendered inside SortableItem.');
  const { setHandle, sortable } = item;
  const setActivator = sortable?.setActivatorNodeRef;
  const attach = useCallback(
    (node: HTMLButtonElement | null) => {
      setActivator?.(node);
      setHandle(node);
      assignRef(ref, node);
    },
    [setActivator, setHandle, ref],
  );

  useEffect(() => {
    if (item.overlay) return;

    return () => setHandle(null);
  }, [item.overlay, setHandle]);

  if (item.overlay || !sortable)
    return <DragHandle {...props} label={label ?? item.label} disabled tabIndex={-1} />;

  return (
    <DragHandle
      {...sortable.attributes}
      {...sortable.listeners}
      {...props}
      label={label ?? item.label}
      disabled={item.disabled || props.disabled}
      data-dnd-activator=""
      ref={attach}
    />
  );
}

/** Replaces the default drag preview (a copy of the item) for the enclosing Sortable or group. */
export function SortableOverlay({ children }: { children: (id: string) => ReactNode }) {
  const { setOverlay } = useEngine('SortableOverlay');
  const render = useRef(children);
  render.current = children;

  useEffect(() => {
    setOverlay((id) => render.current(id));

    return () => setOverlay(null);
  }, [setOverlay]);

  return null;
}

export { createTransferDnd, createRowReorder } from './integrations';
export type { TransferDndPlugin, DataTableRowReorderPlugin } from './integration-types';
