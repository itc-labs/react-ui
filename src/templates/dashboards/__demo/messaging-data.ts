import type { SidebarEntry, SidebarSection } from '../../../modules/sidebar';
import { demoFooterNavigation, demoNavigation } from './data';
import { BookmarkIcon } from '../../../components/icon/outline/bookmark';
import { FolderIcon } from '../../../components/icon/outline/folder';
import { HashtagIcon } from '../../../components/icon/outline/hashtag';
import { HomeIcon } from '../../../components/icon/outline/home';
import { MessagesIcon } from '../../../components/icon/outline/messages';
import { SparklesIcon } from '../../../components/icon/outline/sparkles';

export const messagingPath = '/messages/website/v3/ui-kit';

export const messagingNavigation: SidebarEntry[] = [
  { id: 'assistant', label: 'Assistant', icon: SparklesIcon, href: '/assistant' },
  { id: 'drafts', label: 'Drafts', icon: FolderIcon, href: '/drafts', badge: 2 },
  { id: 'saved', label: 'Saved items', icon: BookmarkIcon, href: '/saved' },
  { id: 'inbox', label: 'Inbox', icon: MessagesIcon, href: '/inbox', badge: 8 },
  { id: 'direct', label: 'Direct messages', icon: MessagesIcon, href: '/direct' },
  {
    id: 'favorites',
    type: 'group',
    label: 'Favorites',
    items: [
      { id: 'olivia', label: 'Olivia Martin', href: '/direct/olivia', badge: 2 },
      { id: 'liam', label: 'Liam Nguyen', href: '/direct/liam', badge: 1 },
      {
        id: 'product',
        label: 'Product updates',
        icon: HashtagIcon,
        href: '/messages/product',
        badge: 4,
      },
    ],
  },
  {
    id: 'channels',
    type: 'group',
    label: 'Channels',
    items: [
      {
        id: 'website',
        type: 'submenu',
        label: 'Website',
        icon: HashtagIcon,
        defaultOpen: true,
        items: [
          {
            id: 'v3',
            type: 'submenu',
            label: 'v3.0',
            defaultOpen: true,
            items: [
              {
                id: 'wireframe',
                label: 'Wireframe',
                href: '/messages/website/v3/wireframe',
              },
              { id: 'design', label: 'Design', href: '/messages/website/v3/design' },
              { id: 'ui-kit', label: 'UI-kit design', href: messagingPath },
            ],
          },
        ],
      },
      {
        id: 'strategy',
        label: 'Strategy',
        icon: HashtagIcon,
        href: '/messages/strategy',
      },
      { id: 'events', label: 'Events', icon: HashtagIcon, href: '/messages/events' },
      {
        id: 'announcements',
        label: 'Announcements',
        icon: HashtagIcon,
        href: '/messages/announcements',
        badge: 3,
      },
    ],
  },
];

export const messagingSections: SidebarSection[] = [
  {
    id: 'northwind',
    label: 'Northwind',
    icon: MessagesIcon,
    items: messagingNavigation,
  },
  { id: 'studio', label: 'Studio', icon: HomeIcon, items: demoNavigation },
  { id: 'settings', label: 'Settings', icon: FolderIcon, items: demoFooterNavigation },
];

export const messagingMembers = [
  { name: 'Olivia Martin', role: 'Owner' },
  { name: 'Liam Nguyen', role: 'Designer' },
  { name: 'Sofia Rossi', role: 'Engineer' },
  { name: 'Mai Tran', role: 'Designer' },
];

export const messagingMessages = [
  {
    id: 'kickoff',
    name: 'Olivia Martin',
    time: '32 min ago',
    dateTime: '2026-11-18T09:10:00+07:00',
    mention: 'Liam Nguyen',
    text: 'The v3.0 component library is ready for review. I’ve added the navigation patterns and updated the spacing guidance. Can you check the handoff before our Thursday review?',
    reactions: ['🙌 4', '👀 2'],
    preview: true,
  },
  {
    id: 'review',
    name: 'Liam Nguyen',
    time: '24 min ago',
    dateTime: '2026-11-18T09:18:00+07:00',
    mention: 'Olivia Martin',
    text: 'The new sidebar feels much clearer. I left two comments on keyboard focus and the empty state. Everything else is ready from design.',
    reactions: ['👍 3'],
    preview: false,
  },
  {
    id: 'engineering',
    name: 'Sofia Rossi',
    time: '12 min ago',
    dateTime: '2026-11-18T09:30:00+07:00',
    mention: 'Mai Tran',
    text: 'I’ve checked the responsive layouts at mobile and tablet sizes. We can use the same tokens in the implementation. Let’s close the focus states today and ship the library tomorrow.',
    reactions: ['🚀 5', '✅ 2'],
    preview: false,
  },
];

export const messagingActivity = [2, 4, 1, 5, 7, 3, 1, 4, 8, 6, 2, 5, 9, 4];
