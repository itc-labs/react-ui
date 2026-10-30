import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Breadcrumb } from './index';

const items = [
  { key: 'home', href: '#breadcrumb-home', title: 'Home' },
  { key: 'parent', href: '#breadcrumb-parent', title: 'Category' },
  { key: 'current', title: 'Current page' },
];
const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  args: { items },
  parameters: {
    docs: {
      description: {
        component:
          'Build a compact navigation path from items, each with a stable key, title and href or callback. The last item represents the current page and is not a link. Items with href use UiLink and the application adapter. The default separator is /; no heading or panel is added.',
      },
    },
  },
} satisfies Meta<typeof Breadcrumb>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { tags: ['usage'] };
export const WithDescription: Story = {
  tags: ['example'],
  args: { description: 'Lorem ipsum dolor sit amet.' },
};
export const LongPath: Story = {
  tags: ['example'],
  args: {
    items: [
      ...items.slice(0, 1),
      {
        key: 'parent',
        title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      },
      { key: 'current', title: 'LoremIpsum'.repeat(8) },
    ],
  },
};
export const Hero: Story = {
  tags: ['variants'],
  render: () => (
    <div className="rounded-panel bg-ink p-5">
      <Breadcrumb items={items} variant="hero" />
    </div>
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    separator: '›',
    className: 'max-w-xl',
    classNames: {
      list: 'gap-x-3',
      link: 'text-brand-700',
      current: 'font-semibold',
      separator: 'text-brand-500',
      description: 'italic',
    },
  },
};
export const LinkComposition: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: {
    items: [
      { key: 'parent', title: 'Parent page', href: '#breadcrumb-current' },
      { key: 'current', title: 'Current page' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Parent page' });
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(canvas.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
    await expect(canvas.getByText('Current page')).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvasElement.querySelectorAll('a')).toHaveLength(1);
  },
};
