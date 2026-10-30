import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColorPicker } from './index';
import { Form, FormField, useAppForm } from '../../modules/form';
import { Button } from '../button';

const meta = {
  title: 'Components/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Choose a color using accessible sliders, a hex field, presets or screen sampling when supported. Hex edits commit on Enter or blur; invalid edits leave the selected value intact. Alpha mode returns eight hex digits. Escape closes the panel and returns focus to the trigger.',
      },
    },
  },
  args: { label: 'Color', defaultValue: '#336699' },
} satisfies Meta<typeof ColorPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
export const WithPresets: Story = {
  tags: ['example'],
  args: { presets: ['#336699', '#993366', '#669933', '#000000', '#ffffff'] },
};
export const Alpha: Story = {
  tags: ['example'],
  args: {
    alpha: true,
    defaultValue: '#33669980',
    presets: ['#33669940', '#33669980', '#336699ff'],
  },
};
export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-4">
      <ColorPicker label="Disabled" defaultValue="#336699" disabled />
      <ColorPicker label="Read only" defaultValue="#336699" readOnly />
      <ColorPicker label="Color" hint="Choose a color." />
      <ColorPicker label="Color" error="Choose a valid color." />
    </div>
  ),
};

function FormDemo() {
  const form = useAppForm({
    defaultValues: { color: '#336699' },
    onSubmit: async () => {},
  });

  return (
    <Form form={form} className="grid gap-4">
      <FormField name="color" label="Color">
        <ColorPicker presets={['#336699', '#993366']} />
      </FormField>
      <form.Subscribe selector={(state) => state.values.color}>
        {(color) => <output>{color}</output>}
      </form.Subscribe>
      <Button type="submit">Save</Button>
    </Form>
  );
}

export const InForm: Story = { tags: ['example'], render: () => <FormDemo /> };
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    presets: ['#336699', '#993366'],
    className: 'border-brand-700 rounded-full',
    classNames: {
      root: 'max-w-sm',
      label: 'text-brand-700',
      swatch: 'rounded-full',
      popover: 'border-brand-700',
      hex: 'font-mono',
      preset: 'rounded-full',
    },
  },
};
