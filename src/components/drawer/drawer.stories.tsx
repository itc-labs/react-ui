import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from './index';
import { Button } from '../button';
import { Textarea } from '../textarea';
import { Select } from '../select';

function Demo({ side = 'right' }: { side?: 'right' | 'left' }) {
  return (
    <Drawer
      title="Ghi chú minh họa"
      description="Drawer từ cạnh màn hình, có focus trap và Escape."
      trigger="Mở editor"
      side={side}
    >
      <div className="grid gap-5">
        <Select
          label="Trạng thái"
          options={[
            { value: 'explore', label: 'Nghiên cứu thêm' },
            { value: 'test', label: 'Đáng thử' },
          ]}
        />
        <Textarea label="Nhận xét riêng" />
      </div>
    </Drawer>
  );
}

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  args: {
    title: 'Ghi chú minh họa',
    trigger: 'Mở editor',
    description: 'Drawer từ cạnh màn hình, có focus trap và Escape.',
    children: (
      <div className="grid gap-5">
        <Select
          label="Trạng thái"
          options={[
            { value: 'explore', label: 'Nghiên cứu thêm' },
            { value: 'test', label: 'Đáng thử' },
          ]}
        />
        <Textarea label="Nhận xét riêng" />
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        component:
          'Panel mở từ cạnh màn hình, phù hợp cho biểu mẫu hoặc nội dung bổ sung. Truyền trigger, title, description và nội dung; hỗ trợ đóng bằng Escape và trả focus về trigger. Có prop title để dùng API dựng sẵn; bỏ prop này khi ghép các phần primitive. title không nhận null/undefined; chuỗi rỗng và 0 vẫn dùng API dựng sẵn.',
      },
    },
  },
} satisfies Meta<typeof Drawer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const Left: Story = { tags: ['example'], args: { side: 'left' } };

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Drawer
      title="Lorem ipsum"
      description="Dolor sit amet."
      trigger="Mở drawer tùy chỉnh"
      className="max-w-md"
      classNames={{
        content: 'bg-brand-50',
        overlay: 'bg-brand-800/40',
        close: 'rounded-full bg-surface',
        header: 'bg-surface',
        title: 'text-brand-700',
        body: 'p-8',
        footer: 'bg-surface',
      }}
      footer={<Button variant="secondary">Tác vụ</Button>}
    >
      <Textarea label="Nội dung" />
    </Drawer>
  ),
};

export const TopAndBottom: Story = {
  tags: ['example'],
  render: () => (
    <div className="flex gap-3">
      <Drawer title="Lorem ipsum" trigger="Mở từ trên" side="top">
        Dolor sit amet.
      </Drawer>
      <Drawer title="Lorem ipsum" trigger="Mở từ dưới" side="bottom">
        Dolor sit amet.
      </Drawer>
    </div>
  ),
};

export const MotionLifecycle: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Mở editor' });
    await userEvent.click(trigger);
    const panel = await body.findByRole('dialog');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    await expect(getComputedStyle(panel).animationName).toBe(
      reduced ? 'none' : 'ui-drawer-right-in',
    );
    await expect(getComputedStyle(panel).transform).toBe('none');
    await Promise.all(panel.getAnimations().map((animation) => animation.finished));
    await userEvent.click(body.getByRole('button', { name: 'Đóng bảng bên' }));
    if (!reduced) {
      await expect(panel).toHaveAttribute('data-state', 'closed');
      await expect(getComputedStyle(panel).animationName).toBe('ui-drawer-right-out');
    }
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
