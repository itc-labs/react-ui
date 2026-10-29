import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { IconButton } from './index';

function Demo() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-3">
      <IconButton
        icon="plus"
        label="Thêm bản minh họa"
        onClick={() => setCount(count + 1)}
      />
      <IconButton icon="settings" label="Cấu hình" variant="secondary" />
      <IconButton icon="close" label="Chưa sẵn sàng" disabled />
      <IconButton icon="search" label="Đang tìm" loading />
      <output>{count}</output>
    </div>
  );
}

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  args: { icon: 'search', label: 'Tìm kiếm' },
  parameters: {
    docs: {
      description: {
        component:
          'Nút chỉ có biểu tượng, luôn cần label để mô tả hành động. Khi loading, biểu tượng được thay bằng spinner và nút ngăn thao tác lặp.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function BusyDemo() {
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="flex items-center gap-3">
      <IconButton
        label="Chạy tác vụ"
        icon="search"
        loading={busy}
        onClick={() => {
          setCount((value) => value + 1);

          setBusy(true);
          timer.current = setTimeout(() => setBusy(false), 700);
        }}
      />
      <output>Số lần gọi: {count}</output>
    </div>
  );
}

export const Playground: Story = { tags: ['usage'] };

export const SizesAndLoading: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid justify-items-start gap-5">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex items-center gap-3">
          {(['primary', 'secondary', 'ghost', 'danger'] as const).map((variant) => (
            <div key={variant} className="flex items-center gap-2">
              <IconButton
                label={`${size} ${variant}`}
                icon="search"
                size={size}
                variant={variant}
              />
              <IconButton
                label={`Đang tải ${size} ${variant}`}
                icon="search"
                size={size}
                variant={variant}
                loading
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <IconButton
      label="Thêm mục"
      icon="plus"
      className="rounded-full bg-brand-100 text-brand-800"
      iconClassName="size-5"
    />
  ),
};

export const LoadingInteraction: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => <BusyDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Chạy tác vụ' });
    const before = button.getBoundingClientRect();
    await userEvent.click(button);
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button.querySelectorAll('svg')).toHaveLength(1);
    await expect(button.getBoundingClientRect().width).toBe(before.width);
    await expect(button.getBoundingClientRect().height).toBe(before.height);
    await userEvent.click(button);
    await expect(canvas.getByText('Số lần gọi: 1')).toBeVisible();
    await waitFor(() => expect(button).toBeEnabled(), { timeout: 2000 });
    await expect(button.querySelectorAll('svg')).toHaveLength(1);
  },
};
