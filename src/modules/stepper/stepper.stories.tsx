import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Stepper } from './index';
const steps = [
  { id: 'entry', label: 'Enter details' },
  { id: 'review', label: 'Review' },
  { id: 'finish', label: 'Finish' },
];
const meta = {
  title: 'Modules/Stepper',
  component: Stepper,
  args: { steps, currentStep: 'entry' },
  parameters: {
    docs: {
      description: {
        component:
          'Read-only progress: the host supplies steps/currentStep. One step has aria-current=step; earlier steps include Completed text for screen readers. Use Tabs for tab navigation. The host handles step changes and API calls.',
      },
    },
  },
} satisfies Meta<typeof Stepper>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FirstStep: Story = { name: 'Playground', tags: ['example'] };

export const SecondStep: Story = {
  tags: ['example'],
  args: { currentStep: 'review' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'Steps' });
    await expect(list.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
    await expect(list.querySelector('[aria-current="step"]')).toHaveTextContent(
      'Review',
    );
    await expect(canvas.getByText('— Completed')).toBeInTheDocument();
  },
};

export const LongLabels: Story = {
  tags: ['example'],
  args: {
    steps: [
      { id: 'entry', label: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
      { id: 'review', label: 'Review and confirm details' },
    ],
    currentStep: 'review',
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Stepper
      currentStep="b"
      steps={[
        { id: 'a', label: 'Step 1' },
        { id: 'b', label: 'Step 2' },
        { id: 'c', label: 'Step 3' },
      ]}
      classNames={{
        root: 'gap-4 rounded-panel bg-surface p-5',
        currentStep: 'text-brand-800',
        indicator: 'size-7',
        separator: 'hidden',
        label: 'font-semibold',
      }}
    />
  ),
};
