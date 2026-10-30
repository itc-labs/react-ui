import type { Meta, StoryObj } from '@storybook/react-vite';
import { OptionGroup } from './index';

const fits = [
  { value: 'regular', label: 'Regular' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'slim', label: 'Slim', disabled: true },
];
const colors = [
  { value: 'pink', label: 'Light Pink', color: '#f1c7d5' },
  { value: 'blue', label: 'Blue', color: '#9abbd7' },
  { value: 'green', label: 'Green', color: '#a8bca3', disabled: true },
  { value: 'cream', label: 'Cream', color: '#e8dfc9' },
];
const sizes = ['XS', 'S', 'M', 'L', 'XL'].map((value) => ({ value, label: value }));
const meta = {
  title: 'Components/OptionGroup',
  component: OptionGroup,
  args: { label: 'Fit', options: fits, defaultValue: 'regular', variant: 'chip' },
  parameters: {
    docs: {
      description: {
        component:
          'Choose a single variant using pill chips or color and image swatches. Supports keyboard navigation, unavailable options and native form values.',
      },
    },
  },
} satisfies Meta<typeof OptionGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
export const Swatches: Story = {
  tags: ['variants'],
  args: {
    label: 'Color',
    options: colors,
    defaultValue: 'pink',
    variant: 'swatch',
    showSelectedLabel: true,
    labelHint: 'Lorem ipsum dolor sit amet.',
  },
};
export const Sizes: Story = {
  tags: ['example'],
  args: { label: 'Size', options: sizes, defaultValue: 'M', maxVisible: 3 },
};
export const ProductVariants: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid max-w-lg gap-6">
      <div>
        <h3 className="text-title font-semibold">Lorem ipsum dolor</h3>
        <p className="text-muted">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>
      <OptionGroup
        label="Color"
        options={colors}
        defaultValue="pink"
        variant="swatch"
        layout="inline"
        showSelectedLabel
      />
      <OptionGroup label="Fit" options={fits} defaultValue="regular" layout="inline" />
      <OptionGroup
        label="Style"
        options={[
          { value: 'plain', label: 'Plain' },
          { value: 'ribbed', label: 'Ribbed' },
        ]}
        defaultValue="plain"
        layout="inline"
      />
      <OptionGroup
        label="Size"
        options={sizes}
        defaultValue="M"
        maxVisible={3}
        layout="inline"
      />
    </div>
  ),
};
export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-6">
      <OptionGroup
        label="Required selection"
        options={fits}
        required
        hint="Choose a fit."
      />
      <OptionGroup
        label="Invalid selection"
        options={fits}
        required
        error="Choose an available fit."
      />
      <OptionGroup
        label="Disabled selection"
        options={fits}
        defaultValue="regular"
        disabled
      />
      <OptionGroup label="Small chips" options={fits} size="sm" />
      <OptionGroup
        label="Large swatches"
        options={colors}
        variant="swatch"
        size="lg"
        defaultValue="blue"
      />
    </div>
  ),
};
export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    className: 'gap-4',
    classNames: {
      root: 'max-w-lg rounded-panel border border-line p-4',
      label: 'font-bold',
      option: 'rounded-control',
      selectedOption: 'bg-brand-800',
      optionLabel: 'font-semibold',
    },
  },
};
