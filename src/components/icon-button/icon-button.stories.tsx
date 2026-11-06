import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { IconButton } from './index';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  args: { icon: 'search', label: 'Search' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'soft', 'outline', 'dashed'],
    },
    tone: {
      control: 'select',
      options: ['neutral', 'brand', 'info', 'success', 'warning', 'danger'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'An icon-only button with the same variants, tones, sizes and native button props as Button. A label is required. While loading, one spinner replaces the icon and repeated actions are disabled.',
      },
    },
  },
} satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;

function BusyDemo() {
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="flex flex-wrap items-center gap-3">
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
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => (
    <div className="grid justify-items-start gap-5">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-3">
          {(
            [
              'primary',
              'secondary',
              'ghost',
              'danger',
              'soft',
              'outline',
              'dashed',
            ] as const
          ).map((variant) => (
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

export const Dashed: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  render: () => (
    <div className="flex gap-3">
      <IconButton variant="dashed" icon="plus" label="Add user" />
      <IconButton variant="dashed" tone="danger" icon="close" label="Remove user" />
    </div>
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

export const Variants: Story = {
  tags: ['variants'],
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(
        [
          'primary',
          'secondary',
          'ghost',
          'danger',
          'soft',
          'outline',
          'dashed',
        ] as const
      ).map((variant) => (
        <div key={variant} className="grid justify-items-center gap-2">
          <IconButton icon="plus" label={`Add item · ${variant}`} variant={variant} />
          <span className="text-ui-sm text-muted">{variant}</span>
        </div>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  tags: ['variants'],
  render: () => (
    <div className="grid gap-5">
      {(['neutral', 'brand', 'info', 'success', 'warning', 'danger'] as const).map(
        (tone) => (
          <div key={tone} className="grid gap-2">
            <span className="text-ui-sm text-muted">{tone}</span>
            <div className="flex flex-wrap items-center gap-4">
              {(['primary', 'soft', 'outline', 'dashed', 'ghost'] as const).map(
                (variant) => (
                  <div key={variant} className="grid justify-items-center gap-1">
                    <IconButton
                      icon="plus"
                      label={`Add item · ${tone} · ${variant}`}
                      tone={tone}
                      variant={variant}
                    />
                    <span className="text-eyebrow text-muted">{variant}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        ),
      )}
    </div>
  ),
};

export const Sizes: Story = {
  tags: ['example'],
  render: () => (
    <div className="flex flex-wrap items-end gap-5">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="grid justify-items-center gap-2">
          <IconButton icon="search" label={`Search · ${size}`} size={size} />
          <span className="text-ui-sm text-muted">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(
        [
          'primary',
          'secondary',
          'ghost',
          'danger',
          'soft',
          'outline',
          'dashed',
        ] as const
      ).map((variant) => (
        <div key={variant} className="grid justify-items-center gap-2">
          <span className="text-ui-sm text-muted">{variant}</span>
          <div className="flex gap-2">
            <IconButton icon="search" label={`Ready · ${variant}`} variant={variant} />
            <IconButton
              icon="search"
              label={`Loading · ${variant}`}
              variant={variant}
              loading
            />
            <IconButton
              icon="search"
              label={`Unavailable · ${variant}`}
              variant={variant}
              disabled
            />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Badges: Story = {
  tags: ['example'],
  render: () => (
    <div className="flex flex-wrap gap-5">
      <IconButton icon="user" label="Notifications" badge={5} variant="secondary" />
      <IconButton
        icon="user"
        label="Unread notifications"
        badge={{ dot: true, tone: 'danger' }}
        variant="ghost"
      />
      <IconButton icon="user" label="Notifications" badge={0} variant="outline" />
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
