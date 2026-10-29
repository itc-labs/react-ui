import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, Button, Card, Input, Textarea } from '../components';

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
          <Badge tone="warning">Đề xuất v1 · chưa duyệt</Badge>
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
      <section className="grid gap-4" aria-label="Palette đề xuất">
        <h2 className="text-section font-semibold">01 / Màu có vai trò</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { title: 'Canvas', role: 'Nền workspace', classes: 'bg-canvas text-ink' },
            {
              title: 'Surface',
              role: 'Card và control',
              classes: 'bg-surface text-ink',
            },
            {
              title: 'Brand',
              role: 'Hành động chính',
              classes: 'bg-brand-700 text-on-brand',
            },
            {
              title: 'Info',
              role: 'Thông tin bổ sung',
              classes: 'bg-info-50 text-info-700',
            },
            {
              title: 'Success',
              role: 'Đã lưu / hoàn tất',
              classes: 'bg-success-50 text-success-700',
            },
            {
              title: 'Warning',
              role: 'Cần kiểm tra thêm',
              classes: 'bg-warning-50 text-warning-700',
            },
            {
              title: 'Danger',
              role: 'Không thực hiện được',
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
        <Card title="02 / Chữ và phân cấp">
          <div className="grid gap-5">
            <p className="text-section font-semibold text-ink">Section · 18px / 1.4</p>
            <p className="text-body text-ink">
              Body · 16px — Lorem ipsum dolor sit amet.
            </p>
            <p className="text-control text-ink">
              Control · 14px — Nội dung nhập và hành động.
            </p>
            <p className="text-ui-sm text-muted">
              UI small · 13px — Nguồn, thời gian và giải thích.
            </p>
            <p className="text-eyebrow uppercase text-muted">
              Eyebrow · 11px — chỉ nhãn phụ
            </p>
          </div>
        </Card>
        <Card title="03 / Khoảng cách và hình khối">
          <div className="grid gap-4">
            <p>
              Nhịp 4px: 4 / 8 / 12 / 16 / 24 / 32 / 48. Nhóm nội dung gần nhau, tăng
              khoảng trống giữa các bước.
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
              Control: radius 8px · Panel: radius 14px · shadow nhẹ, border phân nhóm.
            </p>
          </div>
        </Card>
      </div>
      <section className="grid gap-4" aria-label="Trạng thái tương tác">
        <h2 className="text-section font-semibold">04 / Tương tác và feedback</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Hành động chính</Button>
          <Button variant="secondary">Hành động phụ</Button>
          <Button variant="ghost">Quay lại</Button>
          <Button loading>Đang xử lý</Button>
          <Button disabled>Chưa sẵn sàng</Button>
        </div>
        <p className="text-ui-sm text-muted">
          Dùng Tab để xem focus. Hover là bổ trợ; loading có chữ và ngăn thao tác lặp.
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Item minh họa"
            placeholder="Nhập ý tưởng"
            hint="Label và hint luôn gắn với control."
          />
          <Input
            label="Trường có lỗi"
            defaultValue=""
            error="Nhập nội dung trước khi tiếp tục."
            aria-invalid="true"
          />
        </div>
        <Textarea
          label="Ghi chú minh họa"
          defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
          hint="Be Vietnam Pro hỗ trợ tiếng Việt, font được phục vụ từ ứng dụng."
        />
        <div className="flex flex-wrap gap-3">
          <Badge tone="info">Thông tin bổ sung</Badge>
          <Badge tone="success">Đã lưu</Badge>
          <Badge tone="warning">Cần kiểm tra độ mới</Badge>
          <Badge tone="danger">Chưa kết nối được</Badge>
          <Badge>Chưa có dữ liệu</Badge>
        </div>
      </section>
    </div>
  ),
};
