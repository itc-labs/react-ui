import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  DragHandle,
  SortableBoard,
  SortableList,
  type SortableContainer,
  type SortableItemState,
  type SortableListProps,
} from '@itclabs/react-ui/dnd';
import { UiImage } from '@itclabs/react-ui';

const hue = (item: string) =>
  [...item].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;

const cover = (item: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><rect width="400" height="240" fill="hsl(${hue(item)} 35% 88%)"/><circle cx="200" cy="120" r="60" fill="hsl(${hue(item)} 40% 60%)"/></svg>`)}`;

const meta = {
  title: 'Modules/Dnd',
  component: SortableList<string>,
  args: {
    items: [
      'Lorem ipsum',
      'Dolor sit amet',
      'Consectetur adipiscing',
      'Sed do eiusmod',
    ],
    getId: (item: string) => item,
    orientation: 'vertical',
    disabled: false,
    handle: false,
    gap: 2,
    onReorder: () => {},
    renderItem: (item: string, { handleProps }: SortableItemState) => (
      <div className="flex items-center gap-3 rounded-control border border-line bg-surface p-4 text-ink">
        <DragHandle {...handleProps} label={item} />
        <span>{item}</span>
      </div>
    ),
  },
  render: function Render(args: SortableListProps<string>) {
    const [items, setItems] = useState(args.items);

    useEffect(() => setItems(args.items), [args.items]);

    return (
      <SortableList
        {...args}
        items={items}
        onReorder={(next, event) => {
          setItems(next);
          args.onReorder(next, event);
        }}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        component:
          'Reorder lists and move items between containers with pointer or keyboard input. Import from @itclabs/react-ui/dnd. Apply callback results to your state; items and containers remain controlled. Space or Enter picks up and drops, arrows move, and Escape cancels. Use handle for a dedicated DragHandle, getLabel for readable announcements, and canDrop to restrict board destinations. IDs must be globally unique. Reduced motion removes sorting and drop animation. DndProvider and useSortableItem support advanced compositions.',
      },
    },
  },
} satisfies Meta<typeof SortableList<string>>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  tags: ['usage'],
  args: {
    renderItem: (item: string) => (
      <div className="rounded-control border border-line bg-surface p-4 text-ink">
        {item}
      </div>
    ),
  },
};

export const HandleOnly: Story = {
  tags: ['example'],
  args: { handle: true },
};

export const HorizontalChips: Story = {
  tags: ['example'],
  args: {
    orientation: 'horizontal',
    lockAxis: 'x',
    renderItem: (item: string) => (
      <div className="rounded-full border border-line bg-surface px-4 py-2 text-ink">
        {item}
      </div>
    ),
  },
};

export const Grid: Story = {
  tags: ['example'],
  args: {
    orientation: 'grid',
    className: 'grid-cols-2 lg:grid-cols-4',
    renderItem: (item: string) => (
      <div className="overflow-hidden rounded-panel border border-line bg-surface text-ink">
        <UiImage
          src={cover(item)}
          alt=""
          width={400}
          height={240}
          className="aspect-video w-full object-cover"
          draggable={false}
        />
        <div className="p-4">{item}</div>
      </div>
    ),
  },
};

export const Board: Story = {
  tags: ['example'],
  render: function Render(args: SortableListProps<string>) {
    const [containers, setContainers] = useState<SortableContainer<string>[]>([
      { id: 'todo', title: 'To do', items: ['Lorem ipsum', 'Dolor sit amet'] },
      { id: 'progress', title: 'In progress', items: ['Consectetur adipiscing'] },
      { id: 'done', title: 'Done', items: [] as string[] },
    ]);

    return (
      <SortableBoard
        containers={containers}
        getId={args.getId}
        renderItem={args.renderItem}
        handle
        onMove={setContainers}
      />
    );
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    handle: true,
    className: 'rounded-panel border border-line p-4',
    classNames: {
      root: 'bg-canvas',
      item: 'rounded-panel',
      itemDragging: 'border-brand-700',
      placeholder: 'bg-selected',
      overlay: 'rounded-panel border-brand-700 shadow-overlay',
    },
  },
};
