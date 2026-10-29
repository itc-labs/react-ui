# Storybook authoring

Storybook documents the public UI API. Describe what the control does and when to use it. Do not describe implementation history, compare the API with another repository or use generic filler such as “interactive synthetic examples.” Architecture notes belong in engineering documents.

## One component page

- Set `meta.component` to the actual public component. A composition may use `meta.render` to supply its surrounding context; the source builder expands that render into usable code.
- Start with **Playground** for the smallest useful example. For a simple control, bind args to that control so Controls works. For a required provider/form composition, show real usage and disable meaningless controls for runtime objects.
- Add **Variants**, **Sizes** and **States** only where those dimensions exist. Compare cases in a single gallery instead of one sidebar entry per prop value.
- Keep distinct usage examples when they explain a different contract: remote options, server pagination, selection persistence, composition with routing, crop, etc. A story must answer a different usage question.
- End visible examples with **CustomClasses**. Show the public className/classNames targets.
- Prefer 3–6 visible examples; complex components may need up to 9. Icon catalogs and server/client behavior justify their own examples. Do not add stories merely to match a fixed count.

Use consistent tags: `usage`, `variants`, `states`, `example`, `customization`. Playground comes first; customization comes last. Keep export names stable when a useful story remains, even if its displayed name improves.

## Regression cases

A dedicated interaction test uses `tags: ['!dev', '!autodocs', 'regression']` when a visible gallery already explains the behavior. It remains indexed, directly addressable and eligible for the test runner because it retains the implicit `test` tag. Never remove an interaction assertion solely to shorten navigation. A useful visible usage story may also have a play function.

Storybook's official tag behavior: https://storybook.js.org/docs/writing-stories/tags . These tags control visibility and test eligibility; building Storybook does not execute browser interactions.

## Copy and API documentation

Write the purpose and essential behavior in plain Vietnamese. Keep names of components, props and formats unchanged. Prefer one short paragraph; put detailed contracts next to the specific example or in engineering/API documentation. Decorative headings/body text use lorem ipsum. Labels, validation and accessibility text remain meaningful.

Use `Meta<typeof Component>` / `StoryObj<typeof meta>` where args describe the public component. A composed generic Form or DataTable story may use `Meta` / `StoryObj` and typed JSX/schema fixtures instead of inventing runtime args to satisfy required form state. Do not use a demo component as the documented API. Overview MDX should link to these examples, not repeat multiple copies of the same gallery.

## Verification

Run formatting, typecheck, unit tests and the Storybook build. The source-builder tests parse and typecheck expanded snippets, including shared meta.render. The authoring test checks public copy, regression tags and visible-story budgets. These checks do not replace browser visual review or browser play execution.
