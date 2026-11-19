# StatusTag

`StatusTag` displays the current status and offers allowed moves in a menu. Import it and `StatusOption`, `StatusTagProps`, `StatusTagClassNames` from `@itclabs/react-ui` or `@itclabs/react-ui/status-tag`.

```tsx
import { useState } from 'react';
import { StatusTag, type StatusOption } from '@itclabs/react-ui/status-tag';

type Status = 'draft' | 'active' | 'archived';
const options: readonly StatusOption<Status>[] = [
  { value: 'draft', label: 'Draft', tone: 'info' },
  { value: 'active', label: 'Active', tone: 'success', actionLabel: 'Publish' },
  {
    value: 'archived',
    label: 'Archived',
    tone: 'danger',
    danger: true,
    confirm: { title: 'Archive product?', description: 'This action is final.' },
  },
];

export function ProductStatus() {
  const [value, setValue] = useState<Status>('draft');

  return (
    <StatusTag
      value={value}
      options={options}
      transitions={{
        draft: ['active', 'archived'],
        active: ['archived'],
        archived: [],
      }}
      onValueChange={setValue}
      aria-label="Change status: Lorem ipsum"
    />
  );
}
```

`value` is always controlled: update it only after a successful save. Each option supplies `value`, `label`, and a `TagTone`; optional `icon` accepts an icon name or glyph, `actionLabel` overrides the menu text, `danger` styles the menu and confirmation action, and `confirm` supplies a title, optional description and ReactNode button labels. Use glyph imports in hosts without a registered icon pack.

Omitting `transitions` or an individual status entry permits any other option. An empty entry is final. `exclude` removes moves offered elsewhere. Missing `onValueChange`, no remaining moves, or an unknown value renders a plain Tag. Unknown values display their raw string and warn in development.

`onValueChange` may return a Promise. Until it settles, the chip is busy, a spinner appears, and all moves are blocked. A confirmation stays open with disabled cancellation and a loading confirm button. Success closes it; rejection leaves it open for retry and preserves the controlled value. Handle user-facing errors in the handler, then rethrow so the component can distinguish failure from success. The component logs rejected or synchronously thrown errors with `console.error`; it does not show application-specific error messages. External `loading` and `disabled` also block changes.

`size` defaults to `sm` (`md` is also available); `showIcon` displays the current option's icon. `menuLabel` supplies a heading. The chip's accessible name combines the current label and `aria-label` (localized “Change status” by default), including rich ReactNode labels. Default cancel/confirm/loading strings follow `useUILocale` in English and Vietnamese. Confirmation buttons include icons, with a check fallback when the option has no icon.

Use `className` and `classNames.root/tag/menu/item/dialog` for styling. A base `data-testid="status"` produces `status-tag`, `status-spinner`, `status-menu`, `status-menu-trigger`, `status-menu-item-{encodedValue}`, `status-dialog`, `status-dialog-cancel`, and `status-dialog-confirm`; all parts follow the kit's `partTestId` convention. Plain Tag imports remain independent of StatusTag's menu and dialog dependencies.

Menu items are plain by default. An option opts into a coloured menu item with `actionTone?: DropdownMenuItemTone`, independently of its Tag tone. Import `DropdownMenuItemTone` from `@itclabs/react-ui` or `@itclabs/react-ui/components`; its values are `'default' | 'brand' | 'info' | 'success' | 'warning' | 'danger'`. Resolution follows `actionTone` > `danger: true` > `default`, including an explicit `actionTone: 'default'` override. For example, `{ value: 'active', label: 'Active', tone: 'success', actionLabel: 'Publish', actionTone: 'brand' }` uses brand colors in the menu.

Confirmation buttons use the danger variant when `danger: true` or the resolved menu tone is `danger`; all other actions use primary. An explicit non-danger `actionTone` overrides the menu color but does not suppress a `danger: true` confirmation.

Menu text and inherited icon colors use semantic 700 tokens over highlighted 50 backgrounds. All five semantic pairs pass WCAG AA (4.5:1) with the kit's default tokens; no 800 adjustment is needed. Consumer themes should verify their own token contrast.
