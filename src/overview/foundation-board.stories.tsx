import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag, Button, Card, Input, Textarea } from '../components';

const meta = {
  title: 'Foundations/Review board',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const ProposalV1: Story = {
  render: () => (
    <div className="mx-auto grid max-w-6xl gap-8 p-6 sm:p-10">
      <header className="grid gap-4 border-b border-line pb-8">
        <div>
          <Tag tone="warning">Proposal v1 · pending review</Tag>
        </div>
        <p className="text-eyebrow font-semibold uppercase text-muted">
          @itclabs/react-ui / Foundations / 01
        </p>
        <h1 className="text-display font-semibold text-ink">
          Lorem ipsum.
          <br />
          Dolor sit amet.
        </h1>
        <p className="max-w-2xl text-body text-muted">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
        </p>
      </header>
      <section className="grid gap-4" aria-label="Proposed palette">
        <h2 className="text-section font-semibold">01 / Semantic colors</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              title: 'Canvas',
              role: 'Workspace background',
              classes: 'bg-canvas text-ink',
            },
            {
              title: 'Surface',
              role: 'Cards and controls',
              classes: 'bg-surface text-ink',
            },
            {
              title: 'Brand',
              role: 'Primary action',
              classes: 'bg-brand-700 text-on-brand',
            },
            {
              title: 'Info',
              role: 'Additional information',
              classes: 'bg-info-50 text-info-700',
            },
            {
              title: 'Success',
              role: 'Saved / complete',
              classes: 'bg-success-50 text-success-700',
            },
            {
              title: 'Warning',
              role: 'Needs review',
              classes: 'bg-warning-50 text-warning-700',
            },
            {
              title: 'Danger',
              role: 'Action failed',
              classes: 'bg-danger-50 text-danger-700',
            },
          ].map((item) => (
            <div
              key={item.title}
              className={`rounded-panel border border-line p-6 ${item.classes}`}
            >
              <p className="font-semibold">{item.title}</p>
              <p className="mt-2 text-ui-sm">{item.role}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="02 / Typography and hierarchy">
          <div className="grid gap-5">
            <p className="text-section font-semibold text-ink">Section · 18px / 1.4</p>
            <p className="text-body text-ink">
              Body · 16px — Lorem ipsum dolor sit amet.
            </p>
            <p className="text-control text-ink">
              Control · 14px — Inputs and actions.
            </p>
            <p className="text-ui-sm text-muted">
              UI small · 13px — Sources, timestamps and explanations.
            </p>
            <p className="text-eyebrow uppercase text-muted">
              Eyebrow · 11px — secondary labels only
            </p>
          </div>
        </Card>
        <Card title="03 / Spacing and shape">
          <div className="grid gap-4">
            <p>
              Use a 4px scale: 4 / 8 / 12 / 16 / 24 / 32 / 48. Keep related content
              close together and add space between steps.
            </p>
            <div className="flex flex-wrap items-end gap-4">
              {[
                { label: '8px', className: 'w-2' },
                { label: '16px', className: 'w-4' },
                { label: '24px', className: 'w-6' },
                { label: '32px', className: 'w-8' },
                { label: '48px', className: 'w-12' },
              ].map((item) => (
                <div key={item.label}>
                  <div
                    className={`h-8 rounded-control bg-brand-700 ${item.className}`}
                  />
                  <p className="mt-2 text-ui-sm">{item.label}</p>
                </div>
              ))}
            </div>
            <p>
              Control: 8px radius · Panel: 14px radius · Subtle shadows and borders
              group content.
            </p>
          </div>
        </Card>
      </div>
      <section className="grid gap-4" aria-label="Interaction states">
        <h2 className="text-section font-semibold">04 / Interaction and feedback</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary action</Button>
          <Button variant="secondary">Secondary action</Button>
          <Button variant="ghost">Go back</Button>
          <Button loading>Processing</Button>
          <Button disabled>Not ready</Button>
        </div>
        <p className="text-ui-sm text-muted">
          Press Tab to check focus. Hover adds feedback; loading includes a label and
          prevents repeated actions.
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Example item"
            placeholder="Enter an idea"
            hint="The label and hint are associated with the control."
          />
          <Input
            label="Field with an error"
            defaultValue=""
            error="Enter a value before continuing."
            aria-invalid="true"
          />
        </div>
        <Textarea
          label="Example notes"
          defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
          hint="Be Vietnam Pro supports Vietnamese and is served by the application."
        />
        <div className="flex flex-wrap gap-3">
          <Tag tone="info">Additional information</Tag>
          <Tag tone="success">Saved</Tag>
          <Tag tone="warning">Check freshness</Tag>
          <Tag tone="danger">Unable to connect</Tag>
          <Tag>No data yet</Tag>
        </div>
      </section>
    </div>
  ),
};
