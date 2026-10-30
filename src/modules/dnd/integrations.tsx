'use client';

import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactElement,
} from 'react';
import {
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { DndProvider, DragHandle } from './index';
import { KitIcon } from '../../components/icon/kit-icon';
import { GripVerticalIcon } from '../../components/icon/outline/grip-vertical';
import { GripVerticalIcon as GripVerticalBoldIcon } from '../../components/icon/bold/grip-vertical';
import { Tooltip } from '../../components/tooltip';
import { cn, partTestId } from '../../components/common';
import { focusRingClassName } from '../../components/common/focus-ring';
import { useUILocale } from '../../i18n/provider';
import type {
  DataTableRowReorderPlugin,
  DndIntegrationHandleProps,
  DndIntegrationItem,
  DndIntegrationProviderProps,
  DndIntegrationRowProps,
  TransferDndPlugin,
} from './integration-types';

type Destination = { container: string; index: number };
/** Where a drop would land: a line before/after a row, or the end of a zone. */
type Indicator = { container: string; id?: string; position?: 'before' | 'after' };
const dropLineClassName = cn(
  'data-[drop=before]:shadow-[inset_0_2px_0_0_var(--color-brand-500)] data-[drop=after]:shadow-[inset_0_-2px_0_0_var(--color-brand-500)]',
  '[&[data-drop=before]>td]:shadow-[inset_0_2px_0_0_var(--color-brand-500)] [&[data-drop=after]>td]:shadow-[inset_0_-2px_0_0_var(--color-brand-500)]',
);

function indicatorFor(
  items: readonly DndIntegrationItem[],
  active: DndIntegrationItem,
  container: string,
  target: DndIntegrationItem | undefined,
): Indicator | null {
  if (target?.id === active.id) return null;
  const targets = items.filter((item) => item.container === container);
  if (!target) {
    const last = targets.filter((item) => item.id !== active.id).at(-1);

    return last ? { container, id: last.id, position: 'after' } : { container };
  }
  const after =
    active.container === container && targets.indexOf(target) > targets.indexOf(active);

  return { container, id: target.id, position: after ? 'after' : 'before' };
}

const Context = createContext<{
  items: readonly DndIntegrationItem[];
  disabled: boolean;
  active: string | null;
  indicator: Indicator | null;
  sourceContainer: string | undefined;
  instructions: string;
  containerLabels: Readonly<Record<string, string>> | undefined;
  handles: Map<string, HTMLElement>;
  pendingFocus: { current: string | null };
  startKeyboard: (id: string) => void;
} | null>(null);
const RowContext = createContext<ReturnType<typeof useSortable> | null>(null);

function Provider({
  items,
  containers,
  containerLabels,
  disabled = false,
  overlayClassName,
  testId,
  onDrop,
  onNavigate,
  canDrop,
  children,
}: DndIntegrationProviderProps) {
  const { t } = useUILocale();
  const instructions = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );
  const [active, setActive] = useState<string | null>(null);
  const [keyboard, setKeyboard] = useState<Destination | null>(null);
  const [pointer, setPointer] = useState<{ container: string; id?: string } | null>(
    null,
  );
  const [announcement, setAnnouncement] = useState('');
  const handles = useRef(new Map<string, HTMLElement>());
  const pendingFocus = useRef<string | null>(null);
  const activeItem = items.find((item) => item.id === active);
  const destination = keyboard
    ? {
        container: keyboard.container,
        id: items.filter((item) => item.container === keyboard.container)[
          keyboard.index
        ]?.id,
      }
    : pointer;
  const allowed =
    activeItem &&
    destination &&
    !(canDrop && !canDrop(activeItem.id, destination.container));
  const indicator = allowed
    ? indicatorFor(
        items,
        activeItem,
        destination.container,
        items.find(
          (item) =>
            item.id === destination.id && item.container === destination.container,
        ),
      )
    : null;

  function finish(cancelled: boolean, destination?: Destination) {
    if (!activeItem) return;
    cancelled ||= Boolean(
      disabled ||
      activeItem.disabled ||
      (destination && canDrop && !canDrop(activeItem.id, destination.container)),
    );
    pendingFocus.current = activeItem.id;
    onNavigate?.(
      activeItem.id,
      cancelled
        ? activeItem.container
        : (destination?.container ?? activeItem.container),
    );
    if (!cancelled && destination && !disabled && !activeItem.disabled)
      onDrop(activeItem.id, destination.container, destination.index);
    setAnnouncement(
      t(cancelled ? 'dnd.cancelled' : 'dnd.dropped', {
        label: activeItem.label,
        target: destination
          ? (items.filter((item) => item.container === destination.container)[
              destination.index
            ]?.label ??
            containerLabels?.[destination.container] ??
            destination.container)
          : '',
      }),
    );
    setActive(null);
    setKeyboard(null);
    setPointer(null);
  }

  useEffect(() => {
    if (active || !pendingFocus.current) return;
    const node = handles.current.get(pendingFocus.current);
    if (node) {
      node.focus({ preventScroll: true });
      pendingFocus.current = null;
    }
  });

  useEffect(() => {
    if (!keyboard || !activeItem) return;

    const listener = (event: KeyboardEvent) => {
      if (event.isComposing) return;
      if (event.key === 'Tab') return finish(true);
      if (
        ![
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'Home',
          'End',
          ' ',
          'Enter',
          'Escape',
        ].includes(event.key)
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      if (event.key === 'Escape') return finish(true);
      if (event.key === ' ' || event.key === 'Enter') return finish(false, keyboard);
      let container = keyboard.container;
      let index = keyboard.index;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const position = containers.indexOf(container);
        container =
          containers[
            Math.max(
              0,
              Math.min(
                containers.length - 1,
                position + (event.key === 'ArrowRight' ? 1 : -1),
              ),
            )
          ]!;
        index = 0;
      }
      if (canDrop && !canDrop(activeItem.id, container)) return;
      const targets = items.filter((item) => item.container === container);
      const lastIndex = Math.max(
        0,
        targets.length - (activeItem.container === container ? 1 : 0),
      );
      if (event.key === 'Home') index = 0;
      if (event.key === 'End') index = lastIndex;
      if (event.key === 'ArrowUp') index = Math.max(0, index - 1);
      if (event.key === 'ArrowDown') index = Math.min(lastIndex, index + 1);
      setKeyboard({ container, index });
      const target = targets[Math.min(index, targets.length - 1)];
      if (target) onNavigate?.(target.id, container);
      setAnnouncement(
        t('dnd.over', {
          label: activeItem.label,
          target: target?.label ?? containerLabels?.[container] ?? container,
        }),
      );
    };

    document.addEventListener('keydown', listener, true);

    return () => document.removeEventListener('keydown', listener, true);
  });

  return (
    <Context.Provider
      value={{
        items,
        disabled,
        active,
        indicator,
        sourceContainer: activeItem?.container,
        instructions,
        containerLabels,
        handles: handles.current,
        pendingFocus,
        startKeyboard: (id) => {
          const item = items.find((entry) => entry.id === id);
          if (disabled || !item || item.disabled) return;
          setActive(id);
          setKeyboard({
            container: item.container,
            index: items
              .filter((entry) => entry.container === item.container)
              .indexOf(item),
          });
          setAnnouncement(t('dnd.pickedUp', { label: item.label }));
        },
      }}
    >
      <DndProvider
        collisionDetection={(args) => {
          const hits = pointerWithin(args);
          const rows = hits.filter((hit) => items.some((item) => item.id === hit.id));

          return rows.length ? rows : hits;
        }}
        sensors={sensors}
        accessibility={{ restoreFocus: false }}
        onDragStart={({ active }) => setActive(String(active.id))}
        onDragOver={({ over }) => {
          const target = items.find((item) => item.id === over?.id);
          const container = target?.container ?? over?.data.current?.container;
          setPointer(
            container ? { container, ...(target ? { id: target.id } : {}) } : null,
          );
        }}
        onDragCancel={() => finish(true)}
        onDragEnd={({ over }) => {
          const target = items.find((item) => item.id === over?.id);
          const container = target?.container ?? over?.data.current?.container;
          const index = target
            ? items.filter((item) => item.container === container).indexOf(target)
            : items.filter((item) => item.container === container).length;
          finish(!over, { container, index });
        }}
      >
        <SortableContext items={items.map((item) => item.id)} disabled={disabled}>
          {children}
        </SortableContext>
        <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
          {activeItem && (
            <div
              inert
              aria-hidden="true"
              data-testid={partTestId(testId, 'dragOverlay')}
              className={cn(
                'mx-auto flex w-max max-w-xs cursor-grabbing items-center gap-2 rounded-control border border-brand-500 bg-surface py-2 pr-3 pl-2 text-ui-sm font-medium text-ink shadow-overlay',
                overlayClassName,
              )}
            >
              <KitIcon
                name="gripVertical"
                builtin={{ outline: GripVerticalIcon, bold: GripVerticalBoldIcon }}
                aria-hidden="true"
                className="size-4 shrink-0 text-ink-muted"
              />
              <span className="truncate">{activeItem.label}</span>
            </div>
          )}
        </DragOverlay>
      </DndProvider>
      <span id={instructions} className="sr-only">
        {t('dnd.integrationInstructions')}
      </span>
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </span>
    </Context.Provider>
  );
}

function Row({ id, children, handle = true }: DndIntegrationRowProps) {
  const context = useContext(Context)!;
  const item = context.items.find((entry) => entry.id === id);
  const sortable = useSortable({
    id,
    disabled: Boolean(context.disabled || item?.disabled),
    data: { label: item?.label, container: item?.container },
  });
  const child = children as ReactElement<ComponentPropsWithRef<'div'>>;
  const bindings = !handle
    ? {
        ...sortable.listeners,
        'aria-disabled': context.disabled || undefined,
        role: child.props.role,
        tabIndex: context.disabled ? -1 : 0,
        'aria-describedby': context.instructions,
        onKeyDown: (event: React.KeyboardEvent) => {
          if (event.target !== event.currentTarget || event.nativeEvent.isComposing)
            return;
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            context.startKeyboard(id);
          }
        },
      }
    : {};

  return (
    <RowContext.Provider value={sortable}>
      {cloneElement(child, {
        ...bindings,
        className: cn(
          !handle && 'touch-none',
          !handle && focusRingClassName,
          dropLineClassName,
          child.props.className,
        ),
        ref: (node) => {
          sortable.setNodeRef(node);
          if (!handle) {
            sortable.setActivatorNodeRef(node);
            if (node) context.handles.set(id, node);
            else context.handles.delete(id);
          }
          const ref = child.props.ref;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        },
        style: {
          ...child.props.style,
          opacity: context.active === id ? 0.4 : child.props.style?.opacity,
        },
        'data-dnd-item': id,
        'data-drop':
          context.indicator?.id === id ? context.indicator.position : undefined,
      } as ComponentPropsWithRef<'div'>)}
    </RowContext.Provider>
  );
}

function Handle({ id, disabledReason, ...props }: DndIntegrationHandleProps) {
  const context = useContext(Context)!;
  const sortable = useContext(RowContext)!;
  const item = context.items.find((entry) => entry.id === id)!;
  const disabled = context.disabled || item.disabled;

  const handle = (
    <DragHandle
      {...sortable.attributes}
      {...sortable.listeners}
      {...props}
      ref={(node) => {
        sortable.setActivatorNodeRef(node);
        if (node) {
          context.handles.set(id, node);
          if (context.pendingFocus.current === id) {
            node.focus({ preventScroll: true });
            context.pendingFocus.current = null;
          }
        } else context.handles.delete(id);
      }}
      label={item.label}
      aria-describedby={context.instructions}
      aria-disabled={disabled}
      title={disabledReason}
      onPointerDown={(event) => {
        if (!disabled) sortable.listeners?.onPointerDown?.(event);
      }}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          context.startKeyboard(id);
        }
      }}
    />
  );

  return disabledReason ? <Tooltip content={disabledReason}>{handle}</Tooltip> : handle;
}

function Zone({ id, children }: { id: string; children: ReactElement }) {
  const context = useContext(Context)!;
  const prefix = useId();
  const { setNodeRef } = useDroppable({
    id: `${prefix}-zone`,
    data: { container: id, label: context.containerLabels?.[id] ?? id },
  });
  const child = children as ReactElement<ComponentPropsWithRef<'div'>>;

  const highlighted =
    context.indicator?.container === id &&
    (context.sourceContainer !== id || !context.indicator.id);

  return cloneElement(child, {
    'data-drop-target': highlighted || undefined,
    className: cn(
      'motion-safe:transition-colors data-[drop-target]:bg-brand-50',
      child.props.className,
    ),
    ref: (node) => {
      setNodeRef(node);
      const ref = child.props.ref;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
  } as ComponentPropsWithRef<'div'>);
}

/** Inject into Transfer.dnd. Dragging implies order="selection". */
export function createTransferDnd(): TransferDndPlugin {
  return { Provider, Row, Zone, Handle };
}

/** Inject into DataTable.rowReorder.plugin; the host persists the returned ID order. */
export function createRowReorder(): DataTableRowReorderPlugin {
  return { Provider, Row, Zone, Handle };
}
