import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { IconButton } from './index';

function Demo() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-3">
      <IconButton icon="plus" label="Add example" onClick={() => setCount(count + 1)} />
      <IconButton icon="settings" label="Settings" variant="secondary" />
      <IconButton icon="close" label="Unavailable" disabled />
      <IconButton icon="search" label="Searching" loading />
      <output>{count}</output>
    </div>
  );
}

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  args: { icon: 'search', label: 'Search' },
  parameters: {
    docs: {
      description: {
        component:
          'An icon-only button that requires a label describing its action. While loading, a spinner replaces the icon and the button prevents repeated actions.',
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
        label="Run task"
        icon="search"
        loading={busy}
        onClick={() => {
          setCount((value) => value + 1);

          setBusy(true);
          timer.current = setTimeout(() => setBusy(false), 700);
        }}
      />
      <output>Call count: {count}</output>
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
                label={`Loading ${size} ${variant}`}
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
      label="Add item"
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
    const button = canvas.getByRole('button', { name: 'Run task' });
    const before = button.getBoundingClientRect();
    await userEvent.click(button);
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button.querySelectorAll('svg')).toHaveLength(1);
    await expect(button.getBoundingClientRect().width).toBe(before.width);
    await expect(button.getBoundingClientRect().height).toBe(before.height);
    await userEvent.click(button);
    await expect(canvas.getByText('Call count: 1')).toBeVisible();
    await waitFor(() => expect(button).toBeEnabled(), { timeout: 2000 });
    await expect(button.querySelectorAll('svg')).toHaveLength(1);
  },
};
