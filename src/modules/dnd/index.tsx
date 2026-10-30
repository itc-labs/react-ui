'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
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
  Record<'root' | 'item' | 'itemDragging' | 'overlay' | 'placeholder', string>
>;
export type DragHandleBindings = Omit<ComponentPropsWithRef<'button'>, 'children'>;
export interface SortableItemState {
  handleProps: DragHandleBindings;
  isDragging: boolean;
  isOverlay: boolean;
  index: number;
}
export interface ReorderEvent {
  activeId: string;
  overId: string;
  from: number;
  to: number;
}
export type SortableOrientation = 'vertical' | 'horizontal' | 'grid';
interface SortableOptions<T> extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  getId: (item: T) => string;
  /** Defaults to the stable ID. Supply a human-readable label for announcements. */
  getLabel?: (item: T) => string;
  renderItem: (item: T, state: SortableItemState) => ReactNode;
  renderOverlay?: (item: T, state: SortableItemState) => ReactNode;
  handle?: boolean;
  disabled?: boolean;
  gap?: 0 | 1 | 2 | 3 | 4 | 6 | 8;
  classNames?: SortableClassNames;
  restrictToParent?: boolean;
  lockAxis?: 'x' | 'y';
  'data-testid'?: string;
}
export interface SortableListProps<T> extends SortableOptions<T> {
  items: readonly T[];
  onReorder: (next: T[], event: ReorderEvent) => void;
  orientation?: SortableOrientation;
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

function useDragFocus() {
  const root = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (activeId !== null || pending.current === null) return;
    const row = Array.from(
      root.current?.querySelectorAll<HTMLElement>('[data-dnd-item]') ?? [],
    ).find((node) => node.dataset.dndItem === pending.current);
    row
      ?.querySelector<HTMLElement>('[data-dnd-activator]')
      ?.focus({ preventScroll: true });
    pending.current = null;
  });

  return {
    root,
    activeId,
    setActiveId,
    finish: (id: string) => {
      pending.current = id;
      setActiveId(null);
    },
  };
}

interface ItemProps<T> {
  item: T;
  id: string;
  label: string;
  index: number;
  containerId?: string;
  handle: boolean;
  disabled: boolean;
  reduced: boolean;
  renderItem: SortableOptions<T>['renderItem'];
  classNames: SortableClassNames | undefined;
  testId: string | undefined;
}

function SortableItem<T>({
  item,
  id,
  label,
  index,
  containerId,
  handle,
  disabled,
  reduced,
  renderItem,
  classNames,
  testId,
}: ItemProps<T>) {
  const sortable = useSortable({
    id,
    disabled,
    data: { containerId, label },
    ...(reduced ? { transition: null } : {}),
  });
  const bindings = {
    ...sortable.attributes,
    ...sortable.listeners,
    ref: sortable.setActivatorNodeRef,
    tabIndex: disabled ? -1 : sortable.attributes.tabIndex,
    'data-dnd-activator': '',
  };

  return (
    <div
      ref={sortable.setNodeRef}
      role="listitem"
      data-dnd-item={id}
      data-testid={partTestId(testId, 'item', id)}
      data-dragging={sortable.isDragging || undefined}
      style={{
        transform: CSS.Transform.toString(sortable.transform),
        transition: reduced ? undefined : sortable.transition,
      }}
      className={cn(
        'relative rounded-control border border-transparent motion-reduce:transition-none',
        sortable.isDragging && 'border-2 border-dashed border-brand-500 bg-brand-50',
        classNames?.item,
        sortable.isDragging && classNames?.itemDragging,
        sortable.isDragging && classNames?.placeholder,
      )}
    >
      <div
        {...(!handle ? bindings : {})}
        className={cn(
          'rounded-control',
          !handle && !disabled && 'touch-none cursor-grab active:cursor-grabbing',
          focusRingClassName,
          sortable.isDragging && 'opacity-0',
        )}
      >
        {renderItem(item, {
          handleProps: handle ? { ...bindings, disabled } : { disabled: true },
          isDragging: sortable.isDragging,
          isOverlay: false,
          index,
        })}
      </div>
    </div>
  );
}

function Overlay<T>({
  item,
  index,
  reduced,
  renderItem,
  renderOverlay,
  classNames,
  testId,
}: {
  item: T | undefined;
  index: number;
  reduced: boolean;
  renderItem: SortableOptions<T>['renderItem'];
  renderOverlay: SortableOptions<T>['renderOverlay'];
  classNames: SortableClassNames | undefined;
  testId: string | undefined;
}) {
  return (
    <DragOverlay dropAnimation={reduced ? null : undefined}>
      {item !== undefined && (
        <div
          aria-hidden="true"
          inert
          data-testid={partTestId(testId, 'overlay')}
          className={cn(
            'scale-[1.02] cursor-grabbing rounded-control bg-surface text-ink shadow-overlay ring-2 ring-brand-500',
            classNames?.overlay,
          )}
        >
          {(renderOverlay ?? renderItem)(item, {
            handleProps: { disabled: true, tabIndex: -1 },
            isDragging: true,
            isOverlay: true,
            index,
          })}
        </div>
      )}
    </DragOverlay>
  );
}

/** Controlled ordering: apply next items in onReorder to persist a drop. IDs must be globally unique. */
export function SortableList<T>({
  items,
  getId,
  getLabel,
  onReorder,
  renderItem,
  renderOverlay,
  orientation = 'vertical',
  handle = false,
  disabled = false,
  gap = 2,
  className,
  classNames,
  restrictToParent = false,
  lockAxis,
  'data-testid': testId,
  ref,
  ...props
}: SortableListProps<T>) {
  const { t } = useUILocale();
  const reduced = useReducedMotion();
  const drag = useDragFocus();
  const index = items.findIndex((item) => getId(item) === drag.activeId);

  return (
    <DndProvider
      accessibility={{ restoreFocus: false }}
      modifiers={modifiersFor(restrictToParent, lockAxis)}
      onDragStart={({ active }) => drag.setActiveId(String(active.id))}
      onDragCancel={({ active }) => drag.finish(String(active.id))}
      onDragEnd={({ active, over }) => {
        drag.finish(String(active.id));
        if (disabled || !over || active.id === over.id) return;
        const from = items.findIndex((item) => getId(item) === active.id);
        const to = items.findIndex((item) => getId(item) === over.id);
        if (from >= 0 && to >= 0)
          onReorder(arrayMove([...items], from, to), {
            activeId: String(active.id),
            overId: String(over.id),
            from,
            to,
          });
      }}
    >
      <div
        {...props}
        ref={(node) => {
          drag.root.current = node;
          if (typeof ref === 'function') return ref(node);
          if (ref) ref.current = node;
        }}
        role={props.role ?? 'list'}
        aria-label={props['aria-label'] ?? t('dnd.list')}
        aria-disabled={disabled || undefined}
        data-testid={testId}
        className={cn(
          orientation === 'grid' ? 'grid grid-cols-2' : 'flex',
          orientation === 'vertical' && 'flex-col',
          gaps[gap],
          classNames?.root,
          className,
        )}
      >
        <SortableContext
          items={items.map(getId)}
          strategy={strategies[orientation]}
          disabled={disabled}
        >
          {items.map((item, index) => (
            <SortableItem
              key={getId(item)}
              item={item}
              id={getId(item)}
              label={getLabel?.(item) ?? getId(item)}
              index={index}
              handle={handle}
              disabled={disabled}
              reduced={reduced}
              renderItem={renderItem}
              classNames={classNames}
              testId={testId}
            />
          ))}
        </SortableContext>
      </div>
      <Overlay
        item={items[index]}
        index={index}
        reduced={reduced}
        renderItem={renderItem}
        renderOverlay={renderOverlay}
        classNames={classNames}
        testId={testId}
      />
    </DndProvider>
  );
}

export interface SortableContainer<T> {
  id: string;
  title?: ReactNode;
  items: T[];
}
export interface MoveEvent {
  activeId: string;
  fromContainer: string;
  toContainer: string;
  index: number;
}
export type SortableBoardClassNames = SortableClassNames &
  Partial<Record<'container' | 'containerTitle' | 'containerItems' | 'empty', string>>;
export interface SortableBoardProps<T> extends Omit<SortableOptions<T>, 'classNames'> {
  containers: readonly SortableContainer<T>[];
  onMove: (next: SortableContainer<T>[], event: MoveEvent) => void;
  /** Receives the complete drop zone as children; retain it in the returned layout. */
  renderContainer?: (container: SortableContainer<T>, children: ReactNode) => ReactNode;
  canDrop?: (item: T, from: string, to: string) => boolean;
  classNames?: SortableBoardClassNames;
}

function BoardContainer<T>({
  container,
  dropId,
  disabled,
  classNames,
  children,
  testId,
}: {
  container: SortableContainer<T>;
  dropId: string;
  disabled: boolean;
  classNames: SortableBoardClassNames | undefined;
  children: ReactNode;
  testId: string | undefined;
}) {
  const { t } = useUILocale();
  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
    disabled,
    data: {
      containerId: container.id,
      label: typeof container.title === 'string' ? container.title : container.id,
      isContainer: true,
    },
  });

  return (
    <section
      ref={setNodeRef}
      aria-label={typeof container.title === 'string' ? container.title : container.id}
      data-testid={partTestId(testId, 'container', container.id)}
      data-over={isOver || undefined}
      className={cn(
        'h-full min-w-0 rounded-panel border border-line bg-canvas p-3 motion-safe:transition-colors data-[over]:border-brand-500 data-[over]:bg-brand-50',
        classNames?.container,
      )}
    >
      {container.title != null && (
        <div className={cn('mb-3 font-medium text-ink', classNames?.containerTitle)}>
          {container.title}
        </div>
      )}
      <div
        role="list"
        aria-label={
          typeof container.title === 'string' ? container.title : container.id
        }
        className={cn('flex min-h-16 flex-col gap-2', classNames?.containerItems)}
      >
        {children}
        {!container.items.length && (
          <div
            role="listitem"
            data-testid={partTestId(testId, 'empty', container.id)}
            className={cn(
              'rounded-control border border-dashed border-control-border p-4 text-ui-sm text-ink-muted',
              classNames?.empty,
              classNames?.placeholder,
            )}
          >
            {t('dnd.empty')}
          </div>
        )}
      </div>
    </section>
  );
}

/** Commits one immutable move on drop. Cancelled and rejected drops leave host data untouched. */
export function SortableBoard<T>({
  containers,
  getId,
  getLabel,
  onMove,
  renderItem,
  renderOverlay,
  renderContainer,
  canDrop,
  handle = false,
  disabled = false,
  gap = 4,
  className,
  classNames,
  restrictToParent = false,
  lockAxis,
  'data-testid': testId,
  ref,
  ...props
}: SortableBoardProps<T>) {
  const { t } = useUILocale();
  const prefix = useId();
  const reduced = useReducedMotion();
  const drag = useDragFocus();
  // While dragging, the item is previewed in the column under the pointer; the host only sees the drop.
  const [preview, setPreview] = useState<SortableContainer<T>[] | null>(null);
  const shown = preview ?? containers;

  const containing = (list: readonly SortableContainer<T>[], id: unknown) =>
    list.find((container) => container.items.some((item) => getId(item) === id));

  const source = containing(shown, drag.activeId);
  const activeIndex =
    source?.items.findIndex((item) => getId(item) === drag.activeId) ?? -1;
  const activeItem = source?.items[activeIndex];

  const over = ({ active, over }: DragOverEvent) => {
    if (disabled || !over || over.id === active.id) return;

    setPreview((previous) => {
      const list = previous ?? containers;
      const from = containing(list, active.id);
      const to = list.find(
        (container) => container.id === over.data.current?.containerId,
      );
      const origin = containing(containers, active.id);
      if (!from || !to || !origin || from === to) return previous;
      const item = from.items.find((entry) => getId(entry) === active.id)!;
      if (canDrop && !canDrop(item, origin.id, to.id)) return previous;
      const overIndex = to.items.findIndex((entry) => getId(entry) === over.id);
      const translated = active.rect.current.translated;
      const below =
        overIndex >= 0 &&
        !!translated &&
        translated.top + translated.height / 2 > over.rect.top + over.rect.height / 2;
      const index = overIndex < 0 ? to.items.length : overIndex + (below ? 1 : 0);

      return list.map((container) => {
        if (container === from)
          return {
            ...container,
            items: container.items.filter((entry) => getId(entry) !== active.id),
          };
        if (container === to)
          return {
            ...container,
            items: [
              ...container.items.slice(0, index),
              item,
              ...container.items.slice(index),
            ],
          };

        return container;
      });
    });
  };

  const end = ({ active, over }: DragEndEvent) => {
    const list = preview ?? containers;
    setPreview(null);
    drag.finish(String(active.id));
    if (disabled || !over) return;
    const origin = containing(containers, active.id);
    const to = containing(list, active.id);
    if (!origin || !to) return;
    const originIndex = origin.items.findIndex((item) => getId(item) === active.id);
    const item = origin.items[originIndex]!;
    if (canDrop && !canDrop(item, origin.id, to.id)) return;
    const fromIndex = to.items.findIndex((entry) => getId(entry) === active.id);
    const overIndex = to.items.findIndex((entry) => getId(entry) === over.id);
    const items =
      overIndex >= 0 && overIndex !== fromIndex
        ? arrayMove(to.items, fromIndex, overIndex)
        : to.items;
    const index = items.findIndex((entry) => getId(entry) === active.id);
    if (to.id === origin.id && index === originIndex) return;
    const next = list.map((container) =>
      container === to ? { ...container, items } : container,
    );
    onMove(next, {
      activeId: String(active.id),
      fromContainer: origin.id,
      toContainer: to.id,
      index,
    });
  };

  return (
    <DndProvider
      accessibility={{ restoreFocus: false }}
      modifiers={modifiersFor(restrictToParent, lockAxis)}
      collisionDetection={(args) => {
        const from = containing(containers, args.active.id);
        const item = from?.items.find((item) => getId(item) === args.active.id);
        const allowed = args.droppableContainers.filter((entry) => {
          const target = shown.find(
            (container) => container.id === entry.data.current?.containerId,
          );

          return (
            !!target &&
            !!from &&
            item !== undefined &&
            (!canDrop || canDrop(item, from.id, target.id))
          );
        });
        const columns = allowed.filter((entry) => entry.data.current?.isContainer);
        const pointer = args.pointerCoordinates;

        if (!pointer)
          // Keyboard: nearest card, or a column holding nothing but the dragged item.
          return closestCenter({
            ...args,
            droppableContainers: allowed.filter((entry) => {
              const target = shown.find(
                (container) => container.id === entry.data.current?.containerId,
              )!;

              return (
                !entry.data.current?.isContainer ||
                !target.items.some((item) => getId(item) !== args.active.id)
              );
            }),
          });

        // Pointer: the column under the cursor wins, then the nearest card in it.
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
        const [column] = pointerWithin({
          ...args,
          droppableContainers: columns,
        }).concat(closestCenter({ ...point, droppableContainers: columns }));
        if (!column) return [];
        const containerId = columns.find((entry) => entry.id === column.id)?.data
          .current?.containerId;
        const cards = allowed.filter(
          (entry) =>
            !entry.data.current?.isContainer &&
            entry.data.current?.containerId === containerId,
        );

        return cards.length
          ? closestCenter({ ...point, droppableContainers: cards })
          : [column];
      }}
      onDragStart={({ active }) => drag.setActiveId(String(active.id))}
      onDragOver={over}
      onDragCancel={({ active }) => {
        setPreview(null);
        drag.finish(String(active.id));
      }}
      onDragEnd={end}
    >
      <div
        {...props}
        ref={(node) => {
          drag.root.current = node;
          if (typeof ref === 'function') return ref(node);
          if (ref) ref.current = node;
        }}
        role={props.role ?? 'group'}
        aria-label={props['aria-label'] ?? t('dnd.board')}
        aria-disabled={disabled || undefined}
        data-testid={testId}
        className={cn(
          'grid grid-cols-1 md:grid-cols-3',
          gaps[gap],
          classNames?.root,
          className,
        )}
      >
        {shown.map((container) => {
          const content = (
            <BoardContainer
              container={container}
              dropId={`${prefix}-${container.id}`}
              disabled={disabled}
              classNames={classNames}
              testId={testId}
            >
              <SortableContext
                items={container.items.map(getId)}
                strategy={verticalListSortingStrategy}
                disabled={disabled}
              >
                {container.items.map((item, index) => (
                  <SortableItem
                    key={getId(item)}
                    item={item}
                    id={getId(item)}
                    label={getLabel?.(item) ?? getId(item)}
                    index={index}
                    containerId={container.id}
                    handle={handle}
                    disabled={disabled}
                    reduced={reduced}
                    renderItem={renderItem}
                    classNames={classNames}
                    testId={testId}
                  />
                ))}
              </SortableContext>
            </BoardContainer>
          );

          return (
            <div key={container.id}>
              {renderContainer ? renderContainer(container, content) : content}
            </div>
          );
        })}
      </div>
      <Overlay
        item={activeItem}
        index={activeIndex}
        reduced={reduced}
        renderItem={renderItem}
        renderOverlay={renderOverlay}
        classNames={classNames}
        testId={testId}
      />
    </DndProvider>
  );
}

export { createTransferDnd, createRowReorder } from './integrations';
export type { TransferDndPlugin, DataTableRowReorderPlugin } from './integration-types';
