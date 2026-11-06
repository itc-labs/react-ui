import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { LanguageSwitcher, type LanguageOption } from './index';
import { UIProvider } from '../../theme/provider';

const languages: LanguageOption[] = [
  { value: 'en-US', label: 'English', flag: '🇺🇸' },
  { value: 'vi-VN', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'ja-JP', label: '日本語', flag: '🇯🇵' },
];
const meta = {
  title: 'Components/LanguageSwitcher',
  component: LanguageSwitcher,
  args: { options: languages, value: 'en-US', onValueChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'Chọn hai ngôn ngữ bằng segmented control hoặc chọn nhiều ngôn ngữ trong dropdown có cờ. Ứng dụng truyền options, quản lý locale và cung cấp bản dịch qua UIProvider.',
      },
    },
  },
} satisfies Meta<typeof LanguageSwitcher>;
export default meta;
type Story = StoryObj<typeof meta>;

function Example({
  multiple = false,
  mode = 'auto' as const,
}: {
  multiple?: boolean;
  mode?: 'auto' | 'dropdown' | 'toggle';
}) {
  const [value, setValue] = useState('en-US');

  return (
    <UIProvider locale={value}>
      <div className="flex items-center gap-4">
        <LanguageSwitcher
          options={multiple ? languages : languages.slice(0, 2)}
          value={value}
          onValueChange={setValue}
          mode={mode}
        />
        <output aria-label="Selected locale">{value}</output>
      </div>
    </UIProvider>
  );
}

export const Playground: Story = {
  tags: ['usage'],
  render: () => <Example />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Tiếng Việt' }));
    await expect(canvas.getByLabelText('Selected locale')).toHaveTextContent('vi-VN');
    await userEvent.click(canvas.getByRole('radio', { name: 'English' }));
    await expect(canvas.getByLabelText('Selected locale')).toHaveTextContent('en-US');
  },
};
export const MultipleLanguages: Story = {
  tags: ['example'],
  render: () => <Example multiple />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Language' }));
    await userEvent.click(
      within(document.body).getByRole('menuitemradio', { name: '日本語' }),
    );
    await expect(canvas.getByLabelText('Selected locale')).toHaveTextContent('ja-JP');
  },
};
export const TwoLanguageDropdown: Story = {
  tags: ['example'],
  render: () => <Example mode="dropdown" />,
};
export const QuickToggle: Story = {
  tags: ['example'],
  render: () => <Example mode="toggle" />,
};

export const States: Story = {
  tags: ['states'],
  render: () => (
    <LanguageSwitcher
      options={languages}
      value="en-US"
      onValueChange={() => {}}
      disabled
    />
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <LanguageSwitcher
      options={languages}
      value="en-US"
      onValueChange={() => {}}
      className="rounded-full"
      classNames={{ content: 'min-w-56', flag: 'text-section' }}
    />
  ),
};
