# Accordion

`Accordion`, `AccordionItem`, `AccordionTrigger` and `AccordionContent` are exported from `@itclabs/react-ui` / `@itclabs/react-ui/components`. Radix owns open state, keyboard navigation, disabled behavior and heading/region associations. Use one item with `type="single" collapsible` for an independent collapsible section; there is no equivalent Collapse alias.

```tsx
<Accordion
  type="single"
  collapsible
  variant="separated"
  defaultValue="details"
  items={[
    { value: 'details', trigger: 'Lorem ipsum', content: 'Dolor sit amet.' },
    { value: 'other', trigger: 'Consectetur', content: 'Sed do eiusmod.' },
  ]}
/>
```

## Appearance and composition

- divided (default): rows with separators and no outer panel.
- bordered: one rounded bordered panel with row separators.
- separated: individually rounded bordered panels with gaps.

All appearances use shared color/radius/motion tokens.

Use items for simple data-driven sections or compound children for forms and custom content. Items takes precedence over children. Trigger supplies its heading wrapper; headingLevel defaults to 3 and can be 2–6. Place interactive field content inside Content. Trigger and Content own their rendered structures and do not expose asChild; root/item retain the primitive's composition props.

Single mode uses string value/defaultValue and a string callback. `collapsible` allows every item to close; without it an opened single item stays open until another is selected. Multiple mode uses string[] value/defaultValue and an array callback. The union rejects mismatched value types. Controlled state remains host-owned. Stable item values preserve identity across reordering.

Radix supports arrow/Home/End focus navigation, skipping disabled triggers. Enter/Space toggles the focused native trigger. Native refs and attributes are forwarded. Content opens/closes with Radix measured-height CSS variables and shared duration/easing; motion-safe utilities disable animations under reduced motion. Radix coordinates exit/unmount. Content uses Radix's normal unmount behavior; forceMount is an advanced consumer-owned mounting choice.

## Classes and selectors

Every rendered public part accepts className. Root classNames supplies root/item/header/trigger/icon/content/body defaults; Trigger and Content accept local classNames for their internal parts. Direct caller classes win after defaults/state and inherited slots. Styling maps do not reach DOM. Header uses a real heading and the shared curated chevron remains decorative.

With root data-testid="sections", derived selectors include `sections-item-{value}`, `sections-header-{value}`, `sections-trigger-{value}`, `sections-icon-{value}`, `sections-content-{value}` and `sections-body-{value}`. Values are URI-encoded and stable across reordering. Explicit IDs on public parts override the corresponding derived ID. No base means no implicit IDs.

Storybook Components/Accordion contains Playground, all three variants, states, multiple/controlled usage, one section with composed content and CustomClasses. A hidden test-eligible regression checks keyboard focus/open behavior. DOM tests verify actual single/multiple/controlled behavior, disabled-keyboard skipping, heading/region associations, refs/classes and stable selectors; compile-time coverage rejects array values in single mode.

Reference: [Radix Accordion](https://www.radix-ui.com/primitives/docs/components/accordion).
