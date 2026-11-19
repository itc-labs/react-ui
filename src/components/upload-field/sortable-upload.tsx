'use client';

import { Children, cloneElement, type ReactElement, type ReactNode } from 'react';
import { Sortable, SortableHandle, SortableItem } from '../../modules/dnd';
import type { UploadSortProps } from './upload-sort';

export function SortableUpload({
  blocked,
  orientation,
  items,
  leading = 0,
  onReorder,
  children,
}: UploadSortProps) {
  const nodes = Children.toArray(children.props.children);

  return (
    <Sortable
      asChild
      orientation={orientation}
      value={items.map((item) => item.id)}
      onValueChange={onReorder}
      disabled={blocked}
      className={children.props.className}
    >
      {cloneElement(children, undefined, [
        ...nodes.slice(0, leading),
        ...items.map((item, index) => {
          const tile = nodes[index + leading] as ReactElement<{ children?: ReactNode }>;

          return (
            <SortableItem
              key={item.id}
              id={item.id}
              label={item.label}
              disabled={Boolean(item.disabled)}
              asChild
            >
              {cloneElement(
                tile,
                undefined,
                <>
                  {!item.disabled && (
                    <SortableHandle
                      className={
                        orientation === 'grid'
                          ? 'absolute start-1 top-1 z-10 bg-surface'
                          : undefined
                      }
                    />
                  )}
                  {tile.props.children}
                </>,
              )}
            </SortableItem>
          );
        }),
      ])}
    </Sortable>
  );
}
