import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel } from '@itclabs/react-ui/carousel';

const meta = {
  title: 'Modules/Carousel',
  component: Carousel<string>,
  args: {
    items: [
      'Lorem ipsum',
      'Dolor sit amet',
      'Consectetur adipiscing',
      'Sed do eiusmod',
      'Tempor incididunt',
      'Ut labore',
    ],
    getItemKey: (item) => item,
    renderItem: (item) => (
      <div className="rounded-panel border border-line bg-surface p-8 text-ink">
        {item}
      </div>
    ),
    perView: { base: 1, sm: 2, lg: 3 },
    dots: true,
    'aria-label': 'Featured items',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Browse items or hero content with drag gestures, keyboard arrows and labeled controls. Import from @itclabs/react-ui/carousel. perView sets visible slide columns at Tailwind breakpoints; rows stacks items within each column. index, defaultIndex and onSlideChange address zero-based scroll snaps, including dots. Non-looping edges disable arrows. Autoplay provides pause/play and stops for reduced motion unless autoplay.force is true. Reduced motion also removes the scrolling animation. Use setApi for advanced Embla integration.',
      },
    },
  },
} satisfies Meta<typeof Carousel<string>>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const MultiRowItems: Story = {
  tags: ['example'],
  args: { rows: 2, perView: { base: 1, md: 2, xl: 3 }, gap: 6 },
};

export const Hero: Story = {
  tags: ['example'],
  args: {
    perView: 1,
    loop: true,
    arrowPlacement: 'overlay',
    renderItem: (item) => (
      <div className="flex min-h-64 items-center justify-center rounded-panel bg-selected p-12 text-title text-selected-ink">
        {item}
      </div>
    ),
  },
};

export const Autoplay: Story = {
  tags: ['example'],
  args: {
    perView: 1,
    loop: true,
    autoplay: {
      delay: 3000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
    },
  },
};

export const DragFree: Story = {
  tags: ['example'],
  args: {
    dragFree: true,
    perView: { base: 2, md: 4 },
    dots: false,
    renderItem: (item) => (
      <button
        type="button"
        className="w-full rounded-full border border-line bg-surface px-4 py-2 text-ink focus-visible:outline-2 focus-visible:outline-focus"
      >
        {item}
      </button>
    ),
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'rounded-panel border border-line p-4',
    classNames: {
      root: 'bg-canvas',
      viewport: 'rounded-panel',
      container: 'items-stretch',
      slide: 'bg-surface',
      controls: 'gap-4',
      prev: 'rounded-control',
      next: 'rounded-control',
      dots: 'gap-2',
      dot: 'aria-[current=true]:bg-selected',
    },
  },
};
