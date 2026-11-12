import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';
import * as v from 'valibot';
import { Button } from '../../components/button';
import { DatePicker } from '../../components/date-picker';
import { Dialog, DialogClose } from '../../components/dialog';
import { Input } from '../../components/input';
import { NumberInput } from '../../components/number-input';
import { Select } from '../../components/select';
import { Textarea } from '../../components/textarea';
import {
  Form,
  FormActions,
  FormField,
  FormGrid,
  FormGridItem,
  FormLayout,
  FormSection,
  useAppForm,
} from './index';

function ProfileForm() {
  const form = useAppForm({
    defaultValues: { name: '', email: '', phone: '', city: '' },
    onSubmit: async () => {},
  });

  return (
    <Form form={form} aria-label="Contact details">
      <FormLayout>
        <FormSection
          title="Contact details"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        >
          <FormGrid>
            <FormField name="name" label="Full name" required>
              <Input />
            </FormField>
            <FormField name="email" label="Email">
              <Input type="email" />
            </FormField>
            <FormField name="phone" label="Phone">
              <Input type="tel" />
            </FormField>
            <FormField name="city" label="City">
              <Input />
            </FormField>
          </FormGrid>
        </FormSection>
        <FormActions
          start={
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          }
        >
          <Button type="submit">Save contact</Button>
        </FormActions>
      </FormLayout>
    </Form>
  );
}

const meta = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          'Lay out forms with readable widths, titled sections, responsive field grids and a consistent action bar. FormGrid responds to its own width, so the same form works in pages, drawers and dialogs.',
      },
    },
  },
  title: 'Modules/Form layout',
  component: FormSection,
  subcomponents: { FormLayout, FormGrid, FormGridItem, FormActions },
  render: () => <ProfileForm />,
} satisfies Meta<typeof FormSection>;
export default meta;
type Story = StoryObj<typeof meta>;

const rooms = [
  { value: 'a101', label: 'A101 · Phòng đơn' },
  { value: 'a204', label: 'A204 · Phòng đôi' },
  { value: 'b305', label: 'B305 · Căn hộ mini' },
];

const terms = [
  { value: '3', label: '3 tháng' },
  { value: '6', label: '6 tháng' },
  { value: '12', label: '12 tháng' },
];

const contractSchema = {
  room: v.pipe(v.string(), v.minLength(1, 'Chọn phòng.')),
  startDate: v.pipe(v.string(), v.minLength(1, 'Chọn ngày bắt đầu.')),
  rent: v.pipe(v.number('Nhập giá thuê.'), v.minValue(0, 'Giá thuê không âm.')),
};

function ContractForm() {
  const form = useAppForm({
    defaultValues: {
      room: 'a204',
      startDate: '2026-12-01',
      term: '6',
      endDate: '2027-05-31',
      rent: 3500000 as number | null,
      deposit: 3500000 as number | null,
      billingDay: 5 as number | null,
      notes: '',
    },
    onSubmit: async () => {},
  });

  return (
    <div className="h-128 overflow-y-auto rounded-panel border border-line bg-canvas p-4 sm:p-6">
      <Form form={form} schema={contractSchema} aria-label="Hợp đồng thuê phòng">
        <FormLayout size="lg">
          <FormSection
            variant="card"
            title="Phòng & thời hạn"
            description="Chọn phòng và thời hạn thuê; ngày kết thúc tính theo kỳ hạn."
          >
            <FormGrid columns={2}>
              <FormField name="room" label="Phòng" required>
                <Select options={rooms} />
              </FormField>
              <FormField name="startDate" label="Ngày bắt đầu" required>
                <DatePicker />
              </FormField>
              <FormField name="term" label="Thời hạn">
                <Select options={terms} />
              </FormField>
              <FormField name="endDate" label="Ngày kết thúc">
                <DatePicker disabled />
              </FormField>
            </FormGrid>
          </FormSection>
          <FormSection variant="card" title="Giá & thanh toán">
            <FormGrid columns={3}>
              <FormField name="rent" label="Giá thuê" required>
                <NumberInput min={0} controls={false} endAddon="đ/tháng" />
              </FormField>
              <FormField name="deposit" label="Tiền cọc">
                <NumberInput min={0} controls={false} endAddon="đ" />
              </FormField>
              <FormField name="billingDay" label="Ngày thu tiền">
                <NumberInput min={1} max={28} />
              </FormField>
              <FormGridItem span="full">
                <FormField name="notes" label="Ghi chú">
                  <Textarea rows={3} />
                </FormField>
              </FormGridItem>
            </FormGrid>
          </FormSection>
          <FormActions
            sticky
            start={
              <Button type="button" variant="secondary">
                Về danh sách
              </Button>
            }
          >
            <Button type="submit">Lưu nháp & tiếp tục</Button>
          </FormActions>
        </FormLayout>
      </Form>
    </div>
  );
}

function SectionGallery() {
  return (
    <div className="grid max-w-3xl gap-6">
      <FormSection title="Plain section" description="Lorem ipsum dolor sit amet.">
        <Input label="Lorem ipsum" />
      </FormSection>
      <FormSection
        variant="card"
        title="Card section"
        description="Lorem ipsum dolor sit amet."
        action={
          <Button variant="ghost" size="sm">
            Reset
          </Button>
        }
      >
        <FormGrid>
          <Input label="Lorem ipsum" />
          <Input label="Dolor sit" />
        </FormGrid>
      </FormSection>
      <FormSection
        asFieldset
        variant="card"
        title="Fieldset with legend"
        description="Disabling the fieldset disables every native control inside it."
        disabled
      >
        <FormGrid>
          <Input label="Consectetur" />
          <Input label="Adipiscing" />
        </FormGrid>
      </FormSection>
      <FormSection titleAs="h3" title="Nested heading level">
        <Input label="Sed do eiusmod" />
      </FormSection>
    </div>
  );
}

function GridGallery() {
  return (
    <div className="grid gap-8">
      {([1, 2, 3, 4] as const).map((columns) => (
        <FormSection key={columns} titleAs="h3" title={`columns={${columns}}`}>
          <FormGrid columns={columns}>
            <Input label="Lorem ipsum" />
            <Input label="Dolor sit" hint="Lorem ipsum dolor sit amet." />
            <Input label="Amet" />
            <FormGridItem span={2}>
              <Input label="Span 2" />
            </FormGridItem>
            <FormGridItem span="full">
              <Textarea label="Span full" rows={2} />
            </FormGridItem>
          </FormGrid>
        </FormSection>
      ))}
    </div>
  );
}

function ContainerWidths() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      {['max-w-sm', 'max-w-4xl'].map((width) => (
        <div
          key={width}
          className={`w-full ${width} rounded-panel border border-dashed border-line p-4`}
        >
          <FormGrid columns={3}>
            <Input label="Lorem ipsum" />
            <Input label="Dolor sit" />
            <Input label="Amet" />
          </FormGrid>
          <FormActions
            separator
            className="mt-5"
            start={<Button variant="ghost">Back</Button>}
          >
            <Button variant="secondary">Save draft</Button>
            <Button>Continue</Button>
          </FormActions>
        </div>
      ))}
    </div>
  );
}

function ActionsGallery() {
  return (
    <div className="grid max-w-3xl gap-8">
      <FormActions>
        <Button variant="secondary">Cancel</Button>
        <Button>Save</Button>
      </FormActions>
      <FormActions start={<Button variant="secondary">Back to list</Button>}>
        <Button>Save and continue</Button>
      </FormActions>
      <FormActions
        separator
        start={
          <Button variant="danger" size="sm">
            Delete
          </Button>
        }
      >
        <Button variant="secondary">Save draft</Button>
        <Button>Publish</Button>
      </FormActions>
    </div>
  );
}

function DialogForm() {
  const formId = useId();
  const form = useAppForm({
    defaultValues: { title: '', amount: null as number | null, note: '' },
    onSubmit: async () => {},
  });

  return (
    <Dialog
      title="Add charge"
      description="Lorem ipsum dolor sit amet."
      trigger="Add charge"
      footer={
        <FormActions
          start={
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
          }
        >
          <Button type="submit" form={formId}>
            Add charge
          </Button>
        </FormActions>
      }
    >
      <Form
        id={formId}
        form={form}
        schema={{
          title: v.pipe(v.string(), v.minLength(1, 'Enter a title.')),
          amount: v.number('Enter an amount.'),
        }}
      >
        <FormGrid>
          <FormField name="title" label="Title" required>
            <Input />
          </FormField>
          <FormField name="amount" label="Amount" required>
            <NumberInput min={0} controls={false} endAddon="đ" />
          </FormField>
          <FormGridItem span="full">
            <FormField name="note" label="Note">
              <Textarea rows={2} />
            </FormField>
          </FormGridItem>
        </FormGrid>
      </Form>
    </Dialog>
  );
}

export const Playground: Story = {
  tags: ['usage'],
};

export const ContractExample: Story = {
  tags: ['example'],
  name: 'Contract form',
  parameters: {
    docs: {
      description: {
        story:
          'Card sections with a two- and three-column grid, a full-width notes field and a sticky action bar inside a scroll container. Short values such as prices stay compact instead of stretching across the page.',
      },
    },
  },
  render: () => <ContractForm />,
};

export const Sections: Story = {
  tags: ['variants'],
  parameters: {
    docs: {
      description: {
        story:
          'A section is labelled by its title. `asFieldset` renders a fieldset named by its legend; `titleAs` changes the heading level without changing its style.',
      },
    },
  },
  render: () => <SectionGallery />,
};

export const GridColumns: Story = {
  tags: ['variants'],
  name: 'Grid columns',
  parameters: {
    docs: {
      description: {
        story:
          'FormGridItem spans are clamped to the columns available at the current width, so `span={2}` never creates an extra column on narrow containers.',
      },
    },
  },
  render: () => <GridGallery />,
};

export const Responsive: Story = {
  tags: ['example'],
  parameters: {
    docs: {
      description: {
        story:
          'Grids and action bars respond to their container. Narrow containers use one column and stack full-width actions with the primary action first.',
      },
    },
  },
  render: () => <ContainerWidths />,
};

export const Actions: Story = {
  tags: ['variants'],
  parameters: {
    docs: {
      description: {
        story:
          'Children align to the end with the primary action last. `start` holds back or destructive actions; `separator` draws a top border.',
      },
    },
  },
  render: () => <ActionsGallery />,
};

export const InDialog: Story = {
  tags: ['example'],
  name: 'In a dialog',
  parameters: {
    docs: {
      description: {
        story:
          'Put FormActions in the dialog footer and connect the submit button with `form={formId}` so the actions stay visible while the body scrolls.',
      },
    },
  },
  render: () => <DialogForm />,
};

export const CustomClasses: Story = {
  tags: ['customization'],
  render: () => (
    <FormSection
      variant="card"
      title="Lorem ipsum"
      description="Dolor sit amet."
      className="max-w-2xl"
      classNames={{
        title: 'text-brand-700',
        description: 'text-ink',
        body: 'gap-3',
      }}
    >
      <FormGrid classNames={{ grid: 'gap-x-6' }}>
        <Input label="Lorem ipsum" />
        <Input label="Dolor sit" />
      </FormGrid>
      <FormActions classNames={{ end: 'gap-3' }}>
        <Button>Save</Button>
      </FormActions>
    </FormSection>
  ),
};
