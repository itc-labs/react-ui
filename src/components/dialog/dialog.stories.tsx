import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './index';
import { Button } from '../button';
import { Select } from '../select';
import { Textarea } from '../textarea';

function Demo() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Dialog
      title="Chọn mục minh họa"
      description="Dialog quản lý focus; Select hoạt động trong cùng scope."
      trigger="Mở hộp thoại"
      actions={[{ id: 'done', label: 'Xong', close: true }]}
    >
      <Select
        label="Category trong dialog"
        searchable
        value={value}
        onValueChange={setValue}
        options={[
          { value: 'pets', label: 'Pets' },
          { value: 'gifts', label: 'Gifts' },
        ]}
      />
    </Dialog>
  );
}

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  args: {
    title: 'Chọn mục minh họa',
    trigger: 'Mở hộp thoại',
    description: 'Dialog quản lý focus; Select hoạt động trong cùng scope.',
    actions: [{ id: 'done', label: 'Xong', close: true }],
    children: (
      <Select
        label="Category trong dialog"
        searchable
        options={[
          { value: 'pets', label: 'Pets' },
          { value: 'gifts', label: 'Gifts' },
        ]}
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        component:
          'Hộp thoại dùng cho nội dung hoặc thao tác cần tập trung. Truyền trigger, title, description, footer và nội dung; focus được giữ trong hộp thoại và trả lại khi đóng. Có prop title để dùng API dựng sẵn; bỏ prop này khi ghép các phần primitive. title không nhận null/undefined; chuỗi rỗng và 0 vẫn dùng API dựng sẵn.',
      },
    },
  },
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

function RefFocusDemo() {
  const panel = useRef<HTMLDivElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Mở với focus tùy chỉnh</Button>
      </DialogTrigger>
      <DialogContent
        ref={panel}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          panel.current?.querySelector('textarea')?.focus();
        }}
      >
        <DialogTitle>Focus qua ref của consumer</DialogTitle>
        <DialogDescription>
          Ref content cho phép chọn vị trí focus ban đầu.
        </DialogDescription>
        <Select label="Trạng thái" options={[{ value: 'test', label: 'Đáng thử' }]} />
        <Textarea label="Ghi chú được focus" className="mt-4" />
      </DialogContent>
    </Dialog>
  );
}

export const Playground: Story = { tags: ['usage'] };

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Mở dialog tùy chỉnh</Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-lg rounded-none"
        classNames={{
          overlay: 'bg-brand-800/40',
          close: 'rounded-full bg-brand-100',
          content: 'border-brand-700 p-8',
        }}
      >
        <DialogTitle className="text-brand-700">Lorem ipsum</DialogTitle>
        <DialogDescription className="italic">Dolor sit amet.</DialogDescription>
      </DialogContent>
    </Dialog>
  ),
};

export const KeyboardAndSelect: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Mở hộp thoại' });
    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog');
    await userEvent.click(
      within(dialog).getByRole('combobox', { name: 'Category trong dialog' }),
    );
    await userEvent.click(await body.findByRole('option', { name: 'Pets' }));
    await expect(within(dialog).getByText('Pets')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const MotionLifecycle: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Mở hộp thoại' });
    await userEvent.click(trigger);
    const panel = await body.findByRole('dialog');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    await expect(getComputedStyle(panel).animationName).toBe(
      reduced ? 'none' : 'ui-fade-in',
    );
    await expect(getComputedStyle(panel).transform).toBe('none');
    await Promise.all(panel.getAnimations().map((animation) => animation.finished));
    await userEvent.click(body.getByRole('button', { name: 'Xong' }));
    if (!reduced) {
      await expect(panel).toHaveAttribute('data-state', 'closed');
      await expect(getComputedStyle(panel).animationName).toBe('ui-fade-out');
    }
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const ConsumerRefFocus: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <RefFocusDemo />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Mở với focus tùy chỉnh',
    });
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(
        within(document.body).getByRole('textbox', { name: 'Ghi chú được focus' }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
