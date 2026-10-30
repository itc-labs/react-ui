import type { Meta, StoryObj } from '@storybook/react-vite';
import { RichTextView } from '@itclabs/react-ui/rich-text-view';

const meta = {
  title: 'Modules/RichTextView',
  component: RichTextView,
  args: {
    html: '<h2>Lorem ipsum</h2><p>Dolor <strong>sit amet</strong>.</p><blockquote>Lorem ipsum dolor sit amet.</blockquote><ul><li>Lorem ipsum</li><li>Dolor sit amet</li></ul>',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Display stored Editor HTML with shared typography. Sanitization is enabled by default and runs after mount; the server and initial client render show emptyFallback. For SEO, sanitize HTML on the server and pass sanitize={false} only when the host guarantees trusted, sanitized HTML. Links opening a new tab receive noopener noreferrer nofollow. No animations are used.',
      },
    },
  },
} satisfies Meta<typeof RichTextView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const Sanitization: Story = {
  tags: ['example'],
  args: {
    html: '<p onclick="alert(1)">Lorem ipsum</p><script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">Dolor sit amet</a>',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Script elements, images, event handlers, and unsafe link URLs are stripped from this input.',
      },
    },
  },
};

export const Empty: Story = {
  tags: ['states'],
  args: { html: '', emptyFallback: <p>No content.</p> },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    as: 'article',
    className: 'rounded-panel border border-line p-6',
    classNames: { root: 'text-body' },
  },
};
