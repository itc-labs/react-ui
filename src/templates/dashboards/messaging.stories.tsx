import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DashboardShell } from '@itclabs/react-ui/templates';
import { Avatar } from '../../components/avatar';
import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { DescriptionList } from '../../components/description-list';
import { IconButton } from '../../components/icon-button';
import { Input } from '../../components/input';
import { Popover } from '../../components/popover';
import { Tabs } from '../../components/tabs';
import { Tag } from '../../components/tag';
import { Textarea } from '../../components/textarea';
import { BoldIcon } from '../../components/icon/outline/bold';
import { ItalicIcon } from '../../components/icon/outline/italic';
import { LinkIcon } from '../../components/icon/outline/link';
import { DemoApp, useDemoPath } from './__demo/demo-app';
import { demoAccount } from './__demo/data';
import {
  messagingActivity,
  messagingMembers,
  messagingMessages,
  messagingNavigation,
  messagingPath,
  messagingSections,
} from './__demo/messaging-data';

type MessagingArgs = {
  showRail: boolean;
  showAside: boolean;
  showComposer: boolean;
  showHeader: boolean;
  showThread: boolean;
  showLinkPreview: boolean;
  showReactions: boolean;
  showMainInfo: boolean;
  showLinkedThreads: boolean;
  showActivity: boolean;
  showMembers: boolean;
};

function MessagingPage({
  showComposer,
  showThread,
  showLinkPreview,
  showReactions,
}: Pick<
  MessagingArgs,
  'showComposer' | 'showThread' | 'showLinkPreview' | 'showReactions'
>) {
  const [draft, setDraft] = useState('Thanks for the review, @');
  const [sent, setSent] = useState<string[]>([]);
  const [reactions, setReactions] = useState<string[]>([]);
  const [formatting, setFormatting] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const toggleReaction = (key: string) =>
    setReactions((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );

  return (
    <div className="flex min-h-[calc(100dvh-10rem)] min-w-0 flex-col gap-8">
      {showThread && (
        <section
          aria-label="UI-kit design conversation"
          className="min-w-0 flex-1 space-y-7"
        >
          <div className="flex items-center gap-3 text-ui-sm text-muted">
            <span className="h-px flex-1 bg-line" />
            <h2>Wednesday, November 18, 2026</h2>
            <span className="h-px flex-1 bg-line" />
          </div>
          {messagingMessages.map((message) => (
            <article key={message.id} className="flex min-w-0 items-start gap-3">
              <Avatar alt={message.name} size="sm" />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-ui-sm font-semibold text-ink">{message.name}</h3>
                  <time dateTime={message.dateTime} className="text-ui-sm text-muted">
                    {message.time}
                  </time>
                </div>
                <p className="break-words text-ui-sm leading-relaxed text-ink">
                  <span className="rounded bg-brand-50 px-1 text-accent">
                    @{message.mention}
                  </span>{' '}
                  {message.text}
                </p>
                {message.preview && showLinkPreview && (
                  <Card
                    className="max-w-xl p-4 shadow-none"
                    contentClassName="space-y-3"
                  >
                    <p className="text-ui-sm text-muted">
                      Northwind / Design resources
                    </p>
                    <h4 className="font-semibold text-ink">
                      Website v3.0 · UI kit & handoff
                    </h4>
                    <p>
                      Shared components, interaction notes and the release checklist for
                      our November launch.
                    </p>
                    <div
                      className="grid grid-cols-3 gap-2 rounded-control bg-canvas p-3"
                      aria-hidden="true"
                    >
                      <div className="space-y-2 rounded-control border border-line bg-surface p-2">
                        <div className="h-2 w-2/3 rounded bg-brand-100" />
                        <div className="h-8 rounded bg-brand-50" />
                      </div>
                      <div className="space-y-2 rounded-control border border-line bg-surface p-2">
                        <div className="h-2 w-1/2 rounded bg-line" />
                        <div className="h-8 rounded bg-brand-100" />
                      </div>
                      <div className="space-y-2 rounded-control border border-line bg-surface p-2">
                        <div className="h-2 w-2/3 rounded bg-line" />
                        <div className="h-8 rounded border border-line" />
                      </div>
                    </div>
                    <Popover
                      open={previewOpen}
                      onOpenChange={setPreviewOpen}
                      trigger={
                        <Button size="sm" variant="secondary">
                          Quick view
                        </Button>
                      }
                      label="UI kit handoff preview"
                      content={
                        <div className="space-y-3">
                          <h3 className="font-semibold">Website v3.0 handoff</h3>
                          <p>
                            24 components reviewed. Two focus-state comments remain
                            before the November 19 release.
                          </p>
                          <Tag tone="warning">Review in progress</Tag>
                        </div>
                      }
                    />
                  </Card>
                )}
                {showReactions && (
                  <div
                    className="flex flex-wrap gap-2"
                    aria-label={`Reactions to ${message.name}'s message`}
                  >
                    {message.reactions.map((reaction) => {
                      const key = `${message.id}-${reaction}`;
                      const selected = reactions.includes(key);
                      const [emoji, count] = reaction.split(' ');

                      return (
                        <Tag
                          key={key}
                          selected={selected}
                          tone={selected ? 'brand' : 'neutral'}
                          onClick={() => toggleReaction(key)}
                          aria-label={`React ${emoji}, ${Number(count) + Number(selected)} reactions`}
                        >
                          {emoji} {Number(count) + Number(selected)}
                        </Tag>
                      );
                    })}
                  </div>
                )}
              </div>
            </article>
          ))}
          {sent.map((text, index) => (
            <article key={index} className="flex min-w-0 gap-3">
              <Avatar alt={demoAccount.name} size="sm" />
              <div className="min-w-0">
                <h3 className="text-ui-sm font-semibold">
                  {demoAccount.name}{' '}
                  <span className="font-normal text-muted">Just now</span>
                </h3>
                <p className="mt-2 whitespace-pre-wrap break-words text-ui-sm">
                  {text}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
      {showComposer && (
        <form
          className="mt-auto min-w-0 rounded-panel border border-line bg-surface p-3 shadow-panel"
          aria-label="Message composer"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.trim()) return;

            setSent((current) => [...current, draft.trim()]);

            setDraft('');
          }}
        >
          {draft.endsWith('@') && (
            <div
              className="mb-3 max-w-sm rounded-control border border-line bg-surface p-2 shadow-panel"
              aria-label="Mention suggestions"
            >
              <p className="px-2 py-1 text-ui-sm text-muted">Mention a teammate</p>
              {messagingMembers.slice(0, 3).map((member) => (
                <Button
                  key={member.name}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => setDraft((current) => `${current}${member.name} `)}
                >
                  <Avatar alt={member.name} size="sm" />
                  {member.name}
                </Button>
              ))}
            </div>
          )}
          <Textarea
            aria-label="Message UI-kit design"
            rows={3}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a message… Type @ to mention someone"
            className="resize-y border-0 shadow-none"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            <div className="flex gap-1" role="group" aria-label="Message formatting">
              {(
                [
                  { id: 'bold', icon: BoldIcon, label: 'Bold', marker: '**' },
                  { id: 'italic', icon: ItalicIcon, label: 'Italic', marker: '_' },
                  {
                    id: 'link',
                    icon: LinkIcon,
                    label: 'Insert link',
                    marker: '[Link](https://example.com)',
                  },
                ] as const
              ).map((action) => (
                <IconButton
                  key={action.id}
                  variant="ghost"
                  size="sm"
                  icon={action.icon}
                  label={action.label}
                  aria-pressed={formatting.includes(action.id)}
                  onClick={() => {
                    setFormatting((current) =>
                      current.includes(action.id)
                        ? current.filter((id) => id !== action.id)
                        : [...current, action.id],
                    );

                    setDraft((current) => `${current}${action.marker}`);
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraft('');
                  setFormatting([]);
                }}
              >
                Discard
              </Button>
              <Button type="submit" size="sm" disabled={!draft.trim()}>
                Send message
              </Button>
            </div>
          </div>
          <p role="status" className="sr-only">
            {sent.length ? `${sent.length} messages sent` : ''}
          </p>
        </form>
      )}
    </div>
  );
}

function Messaging(args: MessagingArgs) {
  const { path } = useDemoPath();
  const [bookmarked, setBookmarked] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <DashboardShell
      // The rail and the channel tree share the sidebar; give the tree room for channel names.
      className="[--container-sidebar:19rem]"
      variant="classic"
      sidebar={{
        navigationLabel: 'Messaging navigation',
        header: { title: 'Northwind', subtitle: 'Team workspace' },
        search: (
          <Popover
            open={searchOpen}
            onOpenChange={setSearchOpen}
            trigger={
              <IconButton
                icon="search"
                label="Search workspace"
                variant="ghost"
                size="sm"
              />
            }
            label="Search workspace"
            content={
              <div className="space-y-3">
                <Input
                  aria-label="Search channels"
                  placeholder="Search channels…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <p className="text-ui-sm text-muted">
                  {search
                    ? `Search demo: try UI-kit design in the channel tree.`
                    : 'Find conversations in the channel tree.'}
                </p>
              </div>
            }
          />
        ),
        ...(args.showRail
          ? { sections: messagingSections, defaultSection: 'northwind' }
          : { items: messagingNavigation }),
        currentPath: path,
        density: 'compact',
        // Collapsing a two-tier sidebar keeps the icon rail (and its toggle) visible.
        collapsible: 'icon',
        toggleShortcut: 'mod+b',
      }}
      account={demoAccount}
      accountPlacement="sidebar"
      header={
        args.showHeader ? (
          <>
            <h1 className="inline text-ui-sm font-semibold">
              # Website / v3.0 / UI-kit design
            </h1>{' '}
            <IconButton
              icon="bookmark"
              label={bookmarked ? 'Remove bookmark' : 'Bookmark channel'}
              variant="ghost"
              size="sm"
              aria-pressed={bookmarked}
              onClick={() => setBookmarked((value) => !value)}
            />
          </>
        ) : undefined
      }
      headerActions={
        args.showHeader ? (
          <>
            <Popover
              trigger={
                <IconButton
                  icon="more"
                  label="Channel options"
                  variant="ghost"
                  size="sm"
                />
              }
              label="Channel options"
              content={
                <p className="text-ui-sm">
                  Notifications are on for mentions. This channel is visible to the
                  Northwind workspace.
                </p>
              }
            />
            <Popover
              trigger={
                <IconButton
                  icon="sparkles"
                  label="Ask AI about this thread"
                  variant="ghost"
                  size="sm"
                />
              }
              label="Thread summary"
              content={
                <p className="text-ui-sm">
                  The v3.0 library is ready for handoff. Two keyboard focus comments
                  remain; release is planned for November 19.
                </p>
              }
            />
            <Popover
              trigger={
                <IconButton
                  icon="info"
                  label="Channel information"
                  variant="ghost"
                  size="sm"
                />
              }
              label="Channel information"
              content={
                <p className="text-ui-sm">
                  Design handoff for Website v3.0. Created by Olivia Martin on November
                  4, 2026. Four members.
                </p>
              }
            />
          </>
        ) : undefined
      }
      aside={
        args.showAside ? (
          <Tabs
            label="Thread inspector"
            variant="underline"
            size="sm"
            classNames={{ list: 'gap-4', content: 'border-0 p-0' }}
            items={[
              {
                value: 'info',
                label: 'Info',
                content: (
                  <div className="space-y-7">
                    {args.showMainInfo && (
                      <section className="space-y-4">
                        <h2 className="text-ui-sm font-semibold">Main info</h2>
                        <DescriptionList
                          size="sm"
                          items={[
                            { id: 'creator', label: 'Creator', value: 'Olivia Martin' },
                            {
                              id: 'created',
                              label: 'Date of creation',
                              value: 'November 4, 2026',
                            },
                            {
                              id: 'status',
                              label: 'Status',
                              value: (
                                <Tag tone="success" size="sm">
                                  Active
                                </Tag>
                              ),
                            },
                            {
                              id: 'tags',
                              label: 'Tags',
                              value: '3 · Design, Website, v3.0',
                            },
                            {
                              id: 'tasks',
                              label: 'Tasks',
                              value: '8 open · 16 completed',
                            },
                          ]}
                        />
                      </section>
                    )}
                    {args.showLinkedThreads && (
                      <section className="space-y-3">
                        <h2 className="text-ui-sm font-semibold">Linked threads</h2>
                        <ul className="space-y-2 text-ui-sm">
                          <li>
                            # Wireframe <Tag size="sm">12</Tag>
                          </li>
                          <li>
                            # Design <Tag size="sm">8</Tag>
                          </li>
                          <li>
                            # Release checklist <Tag size="sm">4</Tag>
                          </li>
                        </ul>
                      </section>
                    )}
                    {args.showActivity && (
                      <section className="space-y-3">
                        <h2 className="text-ui-sm font-semibold">Thread activity</h2>
                        <div
                          className="flex flex-wrap gap-1"
                          role="img"
                          aria-label={`Messages per day, November 5–18: ${messagingActivity.join(', ')}`}
                        >
                          {messagingActivity.map((count, index) => (
                            <span
                              key={index}
                              title={`November ${index + 5}: ${count} messages`}
                              className={`size-3 rounded ${count > 6 ? 'bg-accent' : count > 3 ? 'bg-brand-100' : 'bg-brand-50'}`}
                            />
                          ))}
                        </div>
                        <p className="text-ui-sm text-muted">
                          Last 14 days · 61 messages
                        </p>
                      </section>
                    )}
                    {args.showMembers && (
                      <section className="space-y-4">
                        <h2 className="text-ui-sm font-semibold">Members · 4</h2>
                        <ul className="space-y-3">
                          {messagingMembers.map((member) => (
                            <li
                              key={member.name}
                              className="flex min-w-0 flex-wrap items-center gap-2"
                            >
                              <Avatar alt={member.name} size="sm" />
                              <span className="min-w-0 flex-1 text-ui-sm">
                                {member.name}
                              </span>
                              <Tag
                                size="sm"
                                tone={member.role === 'Owner' ? 'brand' : 'neutral'}
                              >
                                {member.role}
                              </Tag>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                  </div>
                ),
              },
              {
                value: 'pins',
                label: 'Pins',
                content: (
                  <Card title="Release checklist" className="p-3 shadow-none">
                    <p>
                      Resolve focus states, confirm responsive layouts and publish on
                      November 19.
                    </p>
                  </Card>
                ),
              },
              {
                value: 'files',
                label: 'Files',
                content: (
                  <DescriptionList
                    size="sm"
                    items={[
                      {
                        id: 'handoff',
                        label: 'ui-kit-handoff.pdf',
                        value: '2.4 MB · Olivia Martin · Nov 18',
                      },
                      {
                        id: 'tokens',
                        label: 'design-tokens.json',
                        value: '18 KB · Sofia Rossi · Nov 17',
                      },
                    ]}
                  />
                ),
              },
              {
                value: 'links',
                label: 'Links',
                content: (
                  <Card title="Website v3.0" className="p-3 shadow-none">
                    <p>UI kit & handoff · shared by Olivia Martin on November 18.</p>
                  </Card>
                ),
              },
            ]}
          />
        ) : undefined
      }
    >
      <MessagingPage {...args} />
    </DashboardShell>
  );
}

const meta = {
  title: 'Templates/Dashboards/Messaging',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A team messaging workspace with a workspace rail, nested channel navigation, a conversation and composer, and a desktop thread inspector. Copy the DashboardShell configuration separately from MessagingPage. Toggle the rail, inspector, composer and conversation details in Controls; the inspector appears from xl and the sidebar becomes a drawer on smaller screens.',
      },
    },
  },
  args: {
    showRail: true,
    showAside: true,
    showComposer: true,
    showHeader: true,
    showThread: true,
    showLinkPreview: true,
    showReactions: true,
    showMainInfo: true,
    showLinkedThreads: true,
    showActivity: true,
    showMembers: true,
  },
  argTypes: {
    showRail: { control: 'boolean' },
    showAside: { control: 'boolean' },
    showComposer: { control: 'boolean' },
    showHeader: { control: 'boolean' },
    showThread: { control: 'boolean' },
    showLinkPreview: { control: 'boolean' },
    showReactions: { control: 'boolean' },
    showMainInfo: { control: 'boolean' },
    showLinkedThreads: { control: 'boolean' },
    showActivity: { control: 'boolean' },
    showMembers: { control: 'boolean' },
  },
  render: (args: MessagingArgs) => (
    <DemoApp initialPath={messagingPath}>
      <Messaging {...args} />
    </DemoApp>
  ),
} satisfies Meta<MessagingArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { tags: ['usage'] };
