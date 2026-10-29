import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Breadcrumb } from './index';

const items = [
  { key: 'home', href: '#breadcrumb-home', title: 'Workspace' },
  { key: 'parent', href: '#breadcrumb-parent', title: 'Danh mục' },
  { key: 'current', title: 'Trang hiện tại' },
];
const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  args: { items },
  parameters: {
    docs: {
      description: {
        component:
          'Đường dẫn gọn bằng items; mỗi mục có key ổn định, title và href hoặc callback. Mục cuối là trang hiện tại, không phải link. Link có href dùng UiLink theo adapter của host. Separator mặc định là dấu /; không có heading hoặc panel bao quanh.',
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
      { key: 'parent', title: 'Nhóm có tên dài để kiểm tra xuống dòng trong vùng hẹp' },
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
      { key: 'parent', title: 'Đường dẫn cha', href: '#breadcrumb-current' },
      { key: 'current', title: 'Trang hiện tại' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Đường dẫn cha' });
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(canvas.getByRole('navigation', { name: 'Đường dẫn' })).toBeVisible();
    await expect(canvas.getByText('Trang hiện tại')).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvasElement.querySelectorAll('a')).toHaveLength(1);
  },
};
