import type { Meta, StoryObj } from '@storybook/react-vite';
import { ImagePreview, type MediaItem } from '@itclabs/react-ui/media-gallery';

const swatch = (fill: string, shape: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="${fill}"/>${shape}</svg>`,
  )}`;

const items: MediaItem[] = [
  {
    id: 'front',
    src: swatch('#e2e8f0', '<circle cx="400" cy="400" r="260" fill="#94a3b8"/>'),
    alt: 'Lorem ipsum front',
  },
  {
    id: 'back',
    src: swatch(
      '#fde68a',
      '<rect x="180" y="180" width="440" height="440" fill="#d97706"/>',
    ),
    alt: 'Lorem ipsum back',
  },
  {
    id: 'detail',
    src: swatch(
      '#bbf7d0',
      '<polygon points="400,140 660,640 140,640" fill="#16a34a"/>',
    ),
    alt: 'Lorem ipsum detail',
  },
  {
    id: 'label',
    src: swatch('#fecaca', '<circle cx="400" cy="400" r="160" fill="#dc2626"/>'),
    alt: 'Lorem ipsum label',
  },
  {
    id: 'package',
    src: swatch(
      '#c7d2fe',
      '<rect x="240" y="120" width="320" height="560" fill="#4f46e5"/>',
    ),
    alt: 'Lorem ipsum package',
  },
];

const meta = {
  title: 'Modules/ImagePreview',
  component: ImagePreview,
  args: { items, size: 'md', shape: 'rounded', maxVisible: 4 },
  parameters: {
    docs: {
      description: {
        component:
          'Compact thumbnails for one or many images, for table cells, detail panels and forms. variant="stack" overlaps the tiles like an avatar group. Clicking a thumbnail opens the fullscreen Lightbox at that image with zoom and navigation; maxVisible collapses the rest into a "+N" tile. Set lightbox to false and use onOpen to handle clicks yourself. Import from @itclabs/react-ui/media-gallery.',
      },
    },
  },
} satisfies Meta<typeof ImagePreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
export const SingleImage: Story = {
  tags: ['usage'],
  args: { items: items.slice(0, 1), size: 'lg' },
};
export const Sizes: Story = {
  tags: ['variants'],
  render: () => (
    <div className="grid gap-4">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <ImagePreview key={size} items={items} size={size} maxVisible={3} />
      ))}
    </div>
  ),
};
export const Shapes: Story = {
  tags: ['variants'],
  render: () => (
    <div className="grid gap-4">
      <ImagePreview items={items} shape="rounded" />
      <ImagePreview items={items} shape="circle" />
    </div>
  ),
};
export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-4">
      <ImagePreview items={[]} />
      <ImagePreview items={items.slice(0, 2)} lightbox={false} />
    </div>
  ),
};
export const Stacked: Story = {
  tags: ['variants'],
  render: () => (
    <div className="grid gap-4">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <ImagePreview
          key={size}
          items={items}
          variant="stack"
          size={size}
          maxVisible={3}
        />
      ))}
      <ImagePreview
        items={items}
        variant="stack"
        shape="circle"
        size="lg"
        maxVisible={4}
      />
    </div>
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    size: 'lg',
    classNames: {
      root: 'gap-3',
      item: 'border-brand-700',
      more: 'bg-brand-700 text-on-brand',
    },
  },
};
