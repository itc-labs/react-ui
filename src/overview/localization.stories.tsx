import catalog from './locales/translations.json';
import type { UITranslations } from '../i18n';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { enUS, viVN, defineLocale, type UILocale } from '../i18n';
import { UIProvider } from '../theme/provider';
import { Button } from '../components/button';
import { Spinner } from '../components/spinner';
import { Select } from '../components/select';
import { Input } from '../components/input';
import { DatePicker } from '../components/date-picker';
import { DateRangePicker } from '../components/date-range-picker';
import { TimePicker } from '../components/time-picker';
import { UploadField } from '../components/upload-field';
import { AvatarUpload } from '@itclabs/react-ui/avatar-upload';
import { Editor } from '@itclabs/react-ui/editor';
import { DataTable } from '../modules/data-table';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from '../components/dialog';

const rows = Array.from({ length: 15 }, (_, index) => ({
  id: `row-${index + 1}`,
  title: `Lorem ${index + 1}`,
}));

function Controls() {
  return (
    <div className="grid gap-8">
      <div className="flex items-center gap-4">
        <Spinner />
        <Button loading>Lorem ipsum</Button>
        <Button loading loadingLabel="Custom status">
          Dolor sit amet
        </Button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Draft" defaultValue="Lorem ipsum" />
        <Select
          label="Select"
          multiple
          clearable
          defaultValue={['a']}
          options={[
            { value: 'a', label: 'Lorem' },
            { value: 'b', label: 'Ipsum' },
          ]}
        />
        <DatePicker name="date" defaultValue="2026-10-06" />
        <DateRangePicker />
        <TimePicker hourCycle={12} />
        <UploadField accept="image/*" />
        <AvatarUpload alt="Lorem ipsum" size="lg" shape="square" />
      </div>
      <Editor defaultValue="<p>Lorem ipsum</p>" />
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Lorem ipsum</DialogTitle>
        </DialogContent>
      </Dialog>
      <DataTable
        caption="Lorem ipsum"
        rows={rows}
        rowId={(row) => row.id}
        columns={[{ accessorKey: 'title', header: 'Lorem' }]}
        selectable
        pagination
      />
      <DataTable caption="Dolor sit amet" rows={[]} rowId={() => ''} columns={[]} />
    </div>
  );
}

const translations = catalog satisfies UITranslations;

function LanguageDemo() {
  const [locale, setLocale] = useState('vi-VN');

  return (
    <section lang={locale} className="grid gap-8">
      <div className="flex flex-wrap gap-2">
        {translations.map((entry) => (
          <Button
            key={entry.locale}
            variant={locale === entry.locale ? 'primary' : 'secondary'}
            onClick={() => setLocale(entry.locale)}
          >
            {new Intl.DisplayNames(['en'], { type: 'language' }).of(
              entry.locale.split('-')[0]!,
            )}
          </Button>
        ))}
      </div>
      <UIProvider locale={locale} translations={translations} fallbackLocale="en-US">
        <Controls />
      </UIProvider>
    </section>
  );
}

const meta = {
  title: 'Foundations/Localization',
  component: LanguageDemo,
  parameters: {
    docs: {
      description: {
        component:
          'Locale changes shared defaults/ARIA/date/number formatting. Consumer-owned content and validation remain caller-owned. Switching locale preserves mounted fields/table state.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const SwitchLanguage: Story = {
  tags: ['!autodocs'],
  parameters: {
    docs: {
      description: {
        story:
          'Starts in Vietnamese to demonstrate locale switching while preserving field and table state.',
      },
      source: {
        code: `import { UIProvider, type UITranslations } from '@itclabs/react-ui';
import catalog from './translations.json';
const translations = catalog satisfies UITranslations;
export function App({locale}: {locale:string}) {
  return <UIProvider locale={locale} translations={translations} fallbackLocale="en-US">{/* application */}</UIProvider>;
}`,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const draft = canvas.getByRole('textbox', { name: 'Draft' });
    await userEvent.clear(draft);
    await userEvent.type(draft, 'Retained draft');
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Chọn dòng row-1' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Trang 2' }));
    await userEvent.click(canvas.getByRole('button', { name: 'English' }));
    await expect(draft).toHaveValue('Retained draft');
    await expect(canvas.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      canvas.getByRole('status', { name: 'Selection status' }),
    ).toHaveTextContent('1 row selected · 0 on this page');
    await expect(
      canvas.getByRole('button', { name: 'Remove Lorem' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Saving changes', { exact: true }),
    ).toBeInTheDocument();
  },
};
export const English: Story = {
  render: () => (
    <section lang={enUS.code}>
      <UIProvider locale={enUS}>
        <Controls />
      </UIProvider>
    </section>
  ),
};
export const Vietnamese: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates built-in labels, formatting and accessibility messages in Vietnamese.',
      },
    },
  },
  render: () => (
    <UIProvider locale={viVN}>
      <Controls />
    </UIProvider>
  ),
};
export const MessageOverrides: Story = {
  render: () => (
    <UIProvider
      locale={enUS}
      messages={{
        'button.processing': 'Saving changes',
        'select.placeholder': 'Choose an item',
      }}
    >
      <div className="grid max-w-sm gap-4">
        <Button loading>Lorem ipsum</Button>
        <Button loading loadingLabel="Uploading">
          Lorem ipsum
        </Button>
        <Select options={[]} />
      </div>
    </UIProvider>
  ),
};
const french = defineLocale({
  code: 'fr-FR',
  messages: {
    'button.processing': 'Traitement',
    'common.loading': 'Chargement',
  },
});
export const PartialLocaleFallback: Story = {
  render: () => (
    <UIProvider locale={french}>
      <div className="flex gap-4">
        <Spinner />
        <Button loading>Lorem ipsum</Button>
      </div>
    </UIProvider>
  ),
};
