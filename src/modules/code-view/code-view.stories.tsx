import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CodeView } from '@itclabs/react-ui/code-view';

const meta = {
  title: 'Modules/CodeView',
  component: CodeView,
  args: {
    code: 'export function Example() {\n  return <p>Lorem ipsum</p>;\n}',
    language: 'tsx',
    filename: 'example.tsx',
    copyable: true,
  },
  argTypes: {
    language: {
      control: 'select',
      options: [
        'tsx',
        'ts',
        'jsx',
        'js',
        'json',
        'css',
        'bash',
        'markdown',
        'html',
        'markup',
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Display read-only source with syntax colors that follow the host theme. Import from @itclabs/react-ui/code-view. Line highlights use one-based numbers or inclusive ranges such as [1, "3-5"]; invalid entries are ignored. title takes precedence over filename. Tab reaches the copy button and the scroll region; Enter or Space activates copying. Clipboard failure leaves success feedback unchanged. No animations are used.',
      },
    },
  },
} satisfies Meta<typeof CodeView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };

export const Languages: Story = {
  tags: ['example'],
  render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      <CodeView
        language="json"
        filename="example.json"
        code={'{ "title": "Lorem ipsum", "count": 3 }'}
      />
      <CodeView
        language="css"
        filename="example.css"
        code={'.example {\n  display: flex;\n}'}
      />
      <CodeView
        language="bash"
        filename="example.sh"
        code={'#!/bin/bash\nexport TITLE="Lorem ipsum"\necho "$TITLE"'}
      />
      <CodeView
        language="markdown"
        filename="example.md"
        code={'# Lorem ipsum\n\n**Dolor sit amet**'}
      />
      <CodeView
        language="html"
        filename="example.html"
        code={'<p class="example">Lorem ipsum</p>'}
      />
    </div>
  ),
};

export const LinesAndScrolling: Story = {
  tags: ['example'],
  args: {
    code: 'const title = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";\n\nexport function example() {\n  return title;\n}\n\nexample();',
    filename: 'example.ts',
    language: 'ts',
    showLineNumbers: true,
    highlightLines: [1, '3-5'],
    wrap: true,
    maxHeight: 160,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    button.focus();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.tab();
    await expect(canvas.getByRole('region')).toHaveFocus();
  },
};

export const CustomClasses: Story = {
  tags: ['customization'],
  args: {
    showLineNumbers: true,
    highlightLines: [2],
    className: 'rounded-none border-accent',
    classNames: {
      header: 'bg-canvas',
      title: 'font-semibold',
      copyButton: 'rounded-full',
      pre: 'p-6',
      code: 'text-ui-sm',
      lineNumber: 'text-accent',
      highlightedLine: 'bg-hover-strong',
    },
  },
};
