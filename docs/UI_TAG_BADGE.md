# Tag and Badge

**Badge (label) is now Tag; Badge is now the count/dot indicator.** This is a breaking change in the 0.x minor release. Rename label-pill imports, JSX and types (`BadgeProps` → `TagProps`, `BadgeTone` → `TagTone`) to Tag. There is no compatibility alias. Icon names containing badge are unchanged.

```tsx
import { Badge, IconButton, Tag } from '@itclabs/react-ui';
import { BellIcon } from '@itclabs/react-ui/icons/outline/bell';

<Tag tone="info" icon="info">Information</Tag>
<Tag selected={active} onClick={() => setActive(!active)}>Filter</Tag>
<Tag onRemove={() => removeItem(id)}>Lorem ipsum</Tag>
<Badge count={5}><IconButton icon={BellIcon} label="Notifications" /></Badge>
<Badge count={120} max={99} />
<Badge dot label="New activity" />
```

Tag preserves the former label pill's tones and default medium appearance. Sizes are sm/md; icon and iconRight accept a kit IconName or direct IconGlyph. Semantic names outside the built-in kit map need scoped icon pack registration. The default is a span. onClick or selected renders a native button; selected sets aria-pressed. Removable clickable tags render sibling selection and removal buttons in a span to avoid nested interactive controls. Native props/ref and className target the outer root. Keep children presentational.

onRemove receives a remove-button click or a Backspace/Delete keyboard event from the focused tag/action. Removal stops click propagation; disabled blocks both actions. The remove button is type=button with a visible focus ring. Default labels use tag.remove with string/number children (or aria-label); supply removeLabel for rich content. Non-clickable removable tags are keyboard focusable. Caller onKeyDown can prevent default to cancel keyboard removal.

Badge wraps optional children without cloning them. Without children it renders inline. count is shown verbatim up to max (default 99), then max + `+`; consumers supply nonnegative integer counts/max. Zero hides by default; showZero displays it. An omitted count hides a count indicator; dot shows a dot independently of count. invisible hides both the visual indicator and its accessible label, preserving children. Tones are danger (default), brand, info, warning, success and neutral. Sizes are sm/md. placement supports top-end (default), top-start, bottom-end and bottom-start. offset is a [horizontal, vertical] pixel inset from that corner and applies to overlays. A ring uses the surface token; override the indicator ring class for a different containing surface.

The visual indicator is aria-hidden. A sibling sr-only label uses badge.count plural messages or badge.dot through UIProvider (vi/en); label overrides the default notification wording. The exact count remains in the accessible label when the visual count overflows max. Child controls keep their own accessible names. Count text fades when updated, respecting reduced motion. Badge does not add a live region; hosts choose announcement policy for their context.

Tag classNames exposes root/icon/label/remove; icon covers both leading and trailing icons. Badge exposes root/indicator/label. Direct className targets the root and merges last. data-testid targets the root; Tag derives -icon/-iconRight/-label/-remove and -action for the sibling selection button. Badge derives -indicator/-label only while visible. No IDs are emitted without a base. Both APIs export through components and the package root.
