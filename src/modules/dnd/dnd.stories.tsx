import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Sortable,
  SortableGroup,
  SortableHandle,
  SortableItem,
  SortableOverlay,
  type SortableProps,
} from '@itclabs/react-ui/dnd';
import { UiImage } from '@itclabs/react-ui';

const labels: Record<string, string> = {
  a: 'Lorem ipsum',
  b: 'Dolor sit amet',
  c: 'Consectetur adipiscing',
  d: 'Sed do eiusmod',
  e: 'Tempor incididunt',
  f: 'Ut labore',
};

const hue = (id: string) => (id.charCodeAt(0) * 47) % 360;

const cover = (id: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240"><rect width="400" height="240" fill="hsl(${hue(id)} 35% 88%)"/><circle cx="200" cy="120" r="60" fill="hsl(${hue(id)} 40% 60%)"/></svg>`)}`;

const cardClassName = 'rounded-control border border-line bg-surface p-4 text-ink';

function useIds(initial = ['a', 'b', 'c', 'd']) {
  return useState<string[]>(initial);
}

const meta = {
  title: 'Modules/Dnd',
  component: Sortable,
  args: { disabled: false, orientation: 'vertical', gap: 2 },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal', 'grid'],
    },
  },
  render: function Render(args: SortableProps) {
    const [ids, setIds] = useIds();

    return (
      <Sortable {...args} value={ids} onValueChange={setIds} aria-label="Lorem ipsum">
        {ids.map((id) => (
          <SortableItem key={id} id={id} label={labels[id]} className={cardClassName}>
            {labels[id]}
          </SortableItem>
        ))}
      </Sortable>
    );
  },
  parameters: {
    docs: {
      description: {
        component:
          'Wrap your own markup to reorder it with pointer or keyboard input. Import from @itclabs/react-ui/dnd. Sortable is the container and owns an ordered ID array through value/onValueChange; SortableItem wraps each entry and must be a direct child (an array from map is fine). Add SortableHandle inside an item to drag only from the handle. Wrap several Sortable containers in SortableGroup to move items between them; the group owns a record of IDs per container and canDrop restricts destinations. Space or Enter picks up and drops, arrows move, and Escape cancels. The drag preview is a copy of the item rendered on document.body; SortableOverlay replaces it. Reduced motion removes sorting and drop animation. DndProvider and useSortableItem support advanced compositions.',
      },
    },
  },
} satisfies Meta<typeof Sortable>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const WithHandle: Story = {
  name: 'With handle',
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'Only the grip starts a drag, so the button in each row stays clickable. Focus a grip and press Space to move it with the keyboard.',
      },
    },
  },
  render: function Render(args: SortableProps) {
    const [ids, setIds] = useIds();

    return (
      <Sortable {...args} value={ids} onValueChange={setIds} aria-label="Lorem ipsum">
        {ids.map((id) => (
          <SortableItem
            key={id}
            id={id}
            label={labels[id]}
            className="flex items-center gap-3 rounded-control border border-line bg-surface p-2 text-ink"
          >
            <SortableHandle />
            <span className="flex-1">{labels[id]}</span>
            <button
              type="button"
              className="rounded-control px-2 text-ui-sm text-muted"
            >
              Edit
            </button>
          </SortableItem>
        ))}
      </Sortable>
    );
  },
};

export const HorizontalChips: Story = {
  name: 'Horizontal chips',
  tags: ['example'],
  args: { orientation: 'horizontal', lockAxis: 'x' },
  render: function Render(args: SortableProps) {
    const [ids, setIds] = useIds();

    return (
      <Sortable {...args} value={ids} onValueChange={setIds} aria-label="Lorem ipsum">
        {ids.map((id) => (
          <SortableItem
            key={id}
            id={id}
            label={labels[id]}
            className="rounded-full border border-line bg-surface px-4 py-2 text-ink"
          >
            {labels[id]}
          </SortableItem>
        ))}
      </Sortable>
    );
  },
};

export const Grid: Story = {
  tags: ['example'],
  args: { orientation: 'grid', gap: 4, className: 'grid-cols-2 lg:grid-cols-4' },
  render: function Render(args: SortableProps) {
    const [ids, setIds] = useIds(['a', 'b', 'c', 'd', 'e', 'f']);

    return (
      <Sortable {...args} value={ids} onValueChange={setIds} aria-label="Lorem ipsum">
        {ids.map((id) => (
          <SortableItem
            key={id}
            id={id}
            label={labels[id]}
            className="overflow-hidden rounded-panel border border-line bg-surface text-ink"
          >
            <UiImage
              src={cover(id)}
              alt=""
              width={400}
              height={240}
              className="aspect-video w-full object-cover"
              draggable={false}
            />
            <div className="p-4">{labels[id]}</div>
          </SortableItem>
        ))}
      </Sortable>
    );
  },
};

const columns = [
  ['todo', 'To do'],
  ['progress', 'In progress'],
  ['done', 'Done'],
] as const;

export const Board: Story = {
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'SortableGroup connects three Sortable columns. The column under the pointer receives the card, and the placeholder shows where it will land. Done accepts cards only from In progress.',
      },
    },
  },
  render: function Render() {
    const [value, setValue] = useState<Record<string, string[]>>({
      todo: ['a', 'b'],
      progress: ['c'],
      done: [],
    });

    return (
      <SortableGroup
        value={value}
        onValueChange={setValue}
        canDrop={(_, from, to) => to !== 'done' || from === 'progress' || from === to}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {columns.map(([column, title]) => (
            <section
              key={column}
              className="grid content-start gap-3 rounded-panel border border-line bg-canvas p-3"
            >
              <h3 className="font-medium text-ink">{title}</h3>
              <Sortable id={column} aria-label={title} className="flex-1">
                {value[column]!.map((id) => (
                  <SortableItem
                    key={id}
                    id={id}
                    label={labels[id]}
                    className="flex items-center gap-2 rounded-control border border-line bg-surface p-2 text-ink"
                  >
                    <SortableHandle />
                    {labels[id]}
                  </SortableItem>
                ))}
              </Sortable>
            </section>
          ))}
        </div>
      </SortableGroup>
    );
  },
};

export const AsChild: Story = {
  name: 'Own elements and overlay',
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'asChild merges sortable behavior into your ul and li, so no wrapper element is added. SortableOverlay renders a compact preview instead of a copy of the row.',
      },
    },
  },
  render: function Render() {
    const [ids, setIds] = useIds();

    return (
      <Sortable asChild value={ids} onValueChange={setIds} aria-label="Lorem ipsum">
        <ul className="max-w-sm divide-y divide-line rounded-panel border border-line bg-surface">
          {ids.map((id) => (
            <SortableItem key={id} id={id} label={labels[id]} asChild>
              <li className="px-4 py-3 text-ink">{labels[id]}</li>
            </SortableItem>
          ))}
          <SortableOverlay>
            {(id) => (
              <span className="inline-block rounded-full bg-accent px-3 py-1 text-ui-sm text-on-brand">
                {labels[id]}
              </span>
            )}
          </SortableOverlay>
        </ul>
      </Sortable>
    );
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'rounded-panel border border-line p-4',
    classNames: {
      root: 'bg-canvas',
      item: 'rounded-panel',
      itemDragging: 'outline-brand-700',
      placeholder: 'bg-selected',
      overlay: 'rounded-panel ring-brand-700',
    },
  },
};
