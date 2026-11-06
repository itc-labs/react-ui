import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ThemeToggle, type ThemeMode } from './index';

const meta = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  args: { value: 'light', onValueChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'Nút icon, nút có nhãn hoặc switch chuyển giao diện sáng/tối. Ứng dụng quản lý value, CSS theme và lưu lựa chọn; control không tự đổi cấu hình toàn trang.',
      },
    },
  },
} satisfies Meta<typeof ThemeToggle>;
export default meta;
type Story = StoryObj<typeof meta>;

function Example() {
  const [value, setValue] = useState<ThemeMode>('light');

  useEffect(() => {
    const element = document.documentElement;
    const previous = element.dataset.colorMode;
    element.dataset.colorMode = value;

    return () => {
      if (previous === undefined) delete element.dataset.colorMode;
      else element.dataset.colorMode = previous;
    };
  }, [value]);

  return (
    <div className="flex flex-wrap items-center gap-6">
      <ThemeToggle value={value} onValueChange={setValue} />
      <ThemeToggle appearance="button" value={value} onValueChange={setValue} />
      <ThemeToggle appearance="switch" value={value} onValueChange={setValue} />
      <output aria-label="Theme mode">{value}</output>
    </div>
  );
}

export const Playground: Story = {
  tags: ['usage'],
  render: () => <Example />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getAllByRole('button', { name: 'Switch to dark mode' })[0]!,
    );
    await expect(canvas.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(canvas.getByRole('switch'));
    await expect(canvas.getByLabelText('Theme mode')).toHaveTextContent('light');
  },
};
export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="flex gap-4">
      <ThemeToggle value="light" onValueChange={() => {}} disabled />
      <ThemeToggle value="dark" appearance="switch" onValueChange={() => {}} disabled />
    </div>
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <ThemeToggle
      value="light"
      onValueChange={() => {}}
      className="rounded-full"
      classNames={{ icon: 'text-warning-700' }}
    />
  ),
};
