import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'padded' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Palette: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        { name: 'Canvas', style: 'bg-canvas' },
        { name: 'Surface', style: 'bg-surface' },
        { name: 'Brand', style: 'bg-brand-700 text-on-brand' },
        { name: 'Info', style: 'bg-info-50 text-info-700' },
        { name: 'Success', style: 'bg-success-50 text-success-700' },
        { name: 'Warning', style: 'bg-warning-50 text-warning-700' },
        { name: 'Danger', style: 'bg-danger-50 text-danger-700' },
      ].map((token) => (
        <div
          key={token.name}
          className={`rounded-panel border border-line p-8 ${token.style}`}
        >
          {token.name}
        </div>
      ))}
    </div>
  ),
};
export const Typography: Story = {
  render: () => (
    <div className="grid gap-6">
      <p className="text-display text-ink">Lorem ipsum dolor sit amet.</p>
      <p className="text-control text-ink">
        Control / 14px — Vietnamese: Nghiên cứu sản phẩm
      </p>
      <p className="text-ui-sm text-muted">
        UI small / 13px — nguồn, thời gian, ghi chú
      </p>
      <p className="text-eyebrow text-muted">EYEBROW / MODULE</p>
    </div>
  ),
};
