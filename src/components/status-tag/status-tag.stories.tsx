import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { StatusTag, type StatusOption, type StatusTagProps } from './index';
import { SendIcon } from '../icon/outline/send';
import { DeleteIcon } from '../icon/outline/delete';
import { EyeOffIcon } from '../icon/outline/eye-off';
import { RotateLeftIcon } from '../icon/outline/rotate-left';

type Status = 'draft' | 'active' | 'inactive' | 'archived';
const options: readonly StatusOption<Status>[] = [
  { value: 'draft', label: 'Draft', tone: 'info', icon: RotateLeftIcon },
  {
    value: 'active',
    label: 'Active',
    actionLabel: 'Publish',
    tone: 'success',
    icon: SendIcon,
  },
  {
    value: 'inactive',
    label: 'Inactive',
    actionLabel: 'Unpublish',
    tone: 'warning',
    icon: EyeOffIcon,
  },
  {
    value: 'archived',
    label: 'Archived',
    actionLabel: 'Archive',
    tone: 'danger',
    icon: DeleteIcon,
    danger: true,
    confirm: {
      title: 'Archive product?',
      description: 'This product cannot be published again.',
      confirmLabel: 'Archive',
    },
  },
];
const transitions = {
  draft: ['active', 'archived'],
  active: ['inactive', 'archived'],
  inactive: ['active', 'archived'],
  archived: [],
} satisfies StatusTagProps<Status>['transitions'];

const meta = {
  title: 'Components/StatusTag',
  component: StatusTag,
  args: { value: 'draft', options, transitions },
  parameters: {
    docs: {
      description: {
        component:
          'Hiển thị trạng thái bằng Tag và cho phép chuyển sang các trạng thái hợp lệ. Hỗ trợ xác nhận, trạng thái đang lưu và chỉ đọc.',
      },
    },
  },
} satisfies Meta<typeof StatusTag>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  tags: ['usage'],
  render: (args: StatusTagProps<string>) => {
    const [value, setValue] = useState(args.value);

    return <StatusTag {...args} value={value} onValueChange={setValue} />;
  },
};

function LifecycleExample() {
  const [value, setValue] = useState<Status>('draft');

  return (
    <StatusTag
      value={value}
      options={options}
      transitions={transitions}
      onValueChange={setValue}
      menuLabel="Product status"
      aria-label="Change status: Lorem ipsum"
    />
  );
}

export const ProductLifecycle: Story = {
  tags: ['example'],
  render: () => <LifecycleExample />,
};

export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="flex items-center gap-3">
      <StatusTag value="draft" options={options} />
      <StatusTag
        value="archived"
        options={options}
        transitions={transitions}
        onValueChange={() => {}}
      />
      <StatusTag value="draft" options={options} disabled onValueChange={() => {}} />
      <StatusTag value="draft" options={options} loading onValueChange={() => {}} />
    </div>
  ),
};

function AsyncExample({ fail = false }: { fail?: boolean }) {
  const [value, setValue] = useState<Status>('draft');
  const [error, setError] = useState('');

  return (
    <div className="flex flex-col items-start gap-2">
      <StatusTag
        value={value}
        options={options}
        transitions={transitions}
        onValueChange={async (next) => {
          setError('');
          await new Promise((resolve) => setTimeout(resolve, 1200));
          if (fail) {
            const failure = new Error('Save failed. Please try again.');
            setError(failure.message);
            throw failure;
          }
          setValue(next);
        }}
      />
      {error && (
        <p role="alert" className="text-danger-700">
          {error}
        </p>
      )}
    </div>
  );
}

export const AsyncSave: Story = {
  tags: ['example'],
  render: () => (
    <div className="flex gap-6">
      <AsyncExample />
      <AsyncExample fail />
    </div>
  ),
};
export const Exclude: Story = {
  tags: ['example'],
  args: {
    exclude: ['archived'],
    onValueChange: () => {},
    menuLabel: 'Archive is available in row actions',
  },
};
export const Sizes: Story = {
  tags: ['variants'],
  render: () => (
    <div className="flex items-center gap-3">
      {(['sm', 'md'] as const).map((size) => (
        <StatusTag
          key={size}
          value="active"
          options={options}
          transitions={transitions}
          size={size}
          showIcon
          onValueChange={() => {}}
        />
      ))}
    </div>
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    onValueChange: () => {},
    className: 'p-2',
    classNames: {
      root: 'rounded-lg bg-canvas',
      tag: 'rounded-full',
      menu: 'min-w-56',
      item: 'font-medium',
      dialog: 'max-w-md',
    },
  },
};
