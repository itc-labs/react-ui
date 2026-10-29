import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from './index';
import { Button } from '../button';

function Demo() {
  const [done, setDone] = useState(false);

  return (
    <div className="grid justify-items-start gap-3">
      <AlertDialog
        trigger="Xác nhận minh họa"
        title="Tiếp tục thao tác?"
        description="Ví dụ xác nhận, không xóa hoặc gửi dữ liệu thật."
        confirmLabel="Tiếp tục"
        onConfirm={() => setDone(true)}
      />
      {done && <p role="status">Đã xác nhận minh họa.</p>}
    </div>
  );
}

function AsyncConfirmDemo() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <AlertDialog
      trigger="Mở xác nhận"
      title="Lorem ipsum"
      description="Dolor sit amet."
      open={open}
      onOpenChange={setOpen}
      closeOnConfirm={false}
      confirmLoading={loading}
      onConfirm={async () => {
        setLoading(true);
        try {
          await new Promise<void>((resolve) => setTimeout(resolve, 1500));
          setOpen(false);
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}

const meta = {
  title: 'Components/AlertDialog',
  component: AlertDialog,
  args: {
    trigger: 'Xác nhận minh họa',
    title: 'Tiếp tục thao tác?',
    description: 'Ví dụ xác nhận, không xóa hoặc gửi dữ liệu thật.',
    confirmLabel: 'Tiếp tục',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Hộp thoại xác nhận hành động. Cung cấp tiêu đề, mô tả và hai lựa chọn rõ ràng; thao tác Hủy được ưu tiên nhận focus. Có prop title để dùng API dựng sẵn; bỏ prop này khi ghép các phần primitive. title không nhận null/undefined; chuỗi rỗng và 0 vẫn dùng API dựng sẵn.',
      },
    },
  },
} satisfies Meta<typeof AlertDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const MotionLifecycle: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Xác nhận minh họa' });
    await userEvent.click(trigger);
    const panel = await body.findByRole('alertdialog');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    await expect(getComputedStyle(panel).animationName).toBe(
      reduced ? 'none' : 'ui-fade-in',
    );
    await userEvent.click(body.getByRole('button', { name: 'Hủy' }));
    if (!reduced) {
      await expect(panel).toHaveAttribute('data-state', 'closed');
      await expect(getComputedStyle(panel).animationName).toBe('ui-fade-out');
    }
    await waitFor(() =>
      expect(body.queryByRole('alertdialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const AsyncConfirm: Story = {
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'Dùng closeOnConfirm={false} và điều khiển open/confirmLoading để giữ hộp thoại trong khi chờ. Khi đang tải, không thể xác nhận lại hoặc đóng bằng Hủy/Escape; host đóng sau khi hoàn tất.',
      },
    },
  },
  render: () => <AsyncConfirmDemo />,
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <AlertDialog
      trigger="Mở xác nhận"
      title="Lorem ipsum"
      description="Dolor sit amet."
      classNames={{
        trigger: 'rounded-full',
        content: 'border-brand-700',
        header: 'bg-brand-50',
        title: 'text-brand-700',
        confirm: 'rounded-full',
        cancel: 'rounded-full',
      }}
    />
  ),
};

export const ConfirmationCallback: Story = {
  tags: ['example'],
  render: () => <Demo />,
};
