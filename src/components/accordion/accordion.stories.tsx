import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './index';
import { Button } from '../button';
import { Input } from '../input';

const items = [
  {
    value: 'first',
    trigger: 'Lorem ipsum',
    content: 'Dolor sit amet, consectetur adipiscing elit.',
  },
  {
    value: 'second',
    trigger: 'Sed do eiusmod',
    content: 'Ut enim ad minim veniam, quis nostrud exercitation.',
  },
  {
    value: 'third',
    trigger: 'Duis aute irure',
    content: 'Excepteur sint occaecat cupidatat non proident.',
  },
];
const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  subcomponents: { AccordionItem, AccordionTrigger, AccordionContent },
  args: { type: 'single', collapsible: true, defaultValue: 'first', items },
  argTypes: {
    type: { control: false },
    variant: { control: 'select', options: ['divided', 'bordered', 'separated'] },
    value: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Expand or collapse content sections using headings and keyboard-accessible buttons. type="single" opens one item; type="multiple" opens several. Use collapsible with single to allow all items to close. Choose variant="divided", "bordered" or "separated"; use one item for a standalone collapsible section.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { tags: ['usage'] };
export const Variants: Story = {
  tags: ['variants'],
  render: () => (
    <div className="grid gap-8 lg:grid-cols-3">
      {(['divided', 'bordered', 'separated'] as const).map((variant) => (
        <div key={variant} className="grid content-start gap-3">
          <p className="text-ui-sm font-medium text-muted">{variant}</p>
          <Accordion
            type="single"
            collapsible
            defaultValue="first"
            variant={variant}
            items={items}
          />
        </div>
      ))}
    </div>
  ),
};
export const States: Story = {
  tags: ['states'],
  render: () => (
    <div className="grid gap-8 sm:grid-cols-2">
      <Accordion
        type="single"
        collapsible
        items={[...items.slice(0, 1), { ...items[1]!, disabled: true }]}
      />
      <Accordion
        type="single"
        disabled
        defaultValue="first"
        variant="bordered"
        items={items}
      />
    </div>
  ),
};
export const Multiple: Story = {
  tags: ['example'],
  // Override render so the single-mode defaults are never forwarded into multiple mode.
  render: () => (
    <Accordion
      type="multiple"
      defaultValue={['first', 'second']}
      variant="separated"
      items={items}
    />
  ),
};

function ControlledExample() {
  const [value, setValue] = useState('first');

  return (
    <div className="grid max-w-xl gap-4">
      <Button variant="secondary" onClick={() => setValue(value ? '' : 'first')}>
        Toggle first item
      </Button>
      <Accordion
        type="single"
        collapsible
        value={value}
        onValueChange={setValue}
        items={items}
      />
      <output>{value || 'No open items'}</output>
    </div>
  );
}

export const Controlled: Story = {
  tags: ['example'],
  render: () => <ControlledExample />,
};
export const SingleSection: Story = {
  tags: ['example'],
  render: () => (
    <Accordion type="single" collapsible variant="bordered">
      <AccordionItem value="details">
        <AccordionTrigger headingLevel={2}>Lorem ipsum</AccordionTrigger>
        <AccordionContent>
          <p className="mb-4">Dolor sit amet, consectetur adipiscing elit.</p>
          <Input label="Content" placeholder="Enter content" />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
export const KeyboardNavigation: Story = {
  tags: ['!dev', '!autodocs', 'regression'],
  args: { 'data-testid': 'sections', defaultValue: '' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('sections-trigger-first'));
    await expect(canvas.getByTestId('sections-trigger-first')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(canvas.getByTestId('sections-trigger-second')).toHaveFocus();
    await expect(canvas.getByTestId('sections-trigger-second')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(canvas.getByTestId('sections-trigger-first')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  },
};
export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <Accordion
      type="single"
      collapsible
      defaultValue="first"
      variant="separated"
      items={items}
      className="max-w-xl gap-5"
      classNames={{
        item: 'border-brand-700',
        header: 'bg-brand-50',
        trigger: 'text-brand-700',
        icon: 'size-5 text-brand-700',
        content: 'text-ink',
        body: 'pb-6',
      }}
    />
  ),
};
