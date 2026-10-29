import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Tag } from './index';
const meta = {
  title: 'Components/Tag',
  component: Tag,
  args: { children: 'Lorem ipsum' },
  parameters: {
    docs: {
      description: {
        component:
          'Nhãn ngắn với tone và kích thước. Có thể thêm icon, thao tác xóa hoặc nút chọn bộ lọc; selected biểu thị trạng thái aria-pressed.',
      },
    },
  },
} satisfies Meta<typeof Tag>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { tags: ['usage'] };
export const AllTones: Story = {
  tags: ['variants'],
  name: 'Variants',
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(['neutral', 'brand', 'info', 'success', 'warning', 'danger'] as const).map(
        (tone) => (
          <Tag key={tone} tone={tone}>
            {tone}
          </Tag>
        ),
      )}
    </div>
  ),
};
export const Sizes: Story = {
  tags: ['variants'],
  render: () => (
    <div className="flex items-center gap-3">
      <Tag size="sm">Lorem ipsum</Tag>
      <Tag size="md">Lorem ipsum</Tag>
    </div>
  ),
};
export const WithIcon: Story = {
  tags: ['example'],
  args: { icon: 'info', iconRight: 'chevronDown', children: 'Thông tin' },
};

function RemovableTags() {
  const [tags, setTags] = useState([
    { id: 'first', label: 'Lorem ipsum' },
    { id: 'second', label: 'Dolor sit amet' },
  ]);

  return (
    <div className="flex gap-3">
      {tags.map((tag) => (
        <Tag
          key={tag.id}
          onRemove={() =>
            setTags((current) => current.filter((item) => item.id !== tag.id))
          }
        >
          {tag.label}
        </Tag>
      ))}
    </div>
  );
}

export const Removable: Story = { tags: ['example'], render: () => <RemovableTags /> };

function FilterTags() {
  const [selected, setSelected] = useState('all');

  return (
    <div className="flex gap-3">
      {[
        { id: 'all', label: 'Tất cả' },
        { id: 'unread', label: 'Chưa đọc' },
      ].map((item) => (
        <Tag
          key={item.id}
          selected={selected === item.id}
          onClick={() => setSelected(item.id)}
        >
          {item.label}
        </Tag>
      ))}
    </div>
  );
}

export const Clickable: Story = {
  tags: ['example'],
  name: 'Clickable / Selectable',
  render: () => <FilterTags />,
};
export const Disabled: Story = {
  tags: ['states'],
  args: { disabled: true, selected: true, onClick: () => {}, onRemove: () => {} },
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    icon: 'info',
    onRemove: () => {},
    className: 'rounded-full',
    classNames: {
      root: 'bg-brand-100',
      icon: 'text-brand-700',
      label: 'font-bold',
      remove: 'rounded-full bg-surface',
    },
  },
};
