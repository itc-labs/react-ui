# Coding conventions

Applies to the standalone `@itclabs/react-ui` library. Preserve existing public APIs, styling targets and automation contracts.

## Code organization

Use `src/components/<name>/index.tsx` for controls, `src/modules/<name>/index.tsx` for reusable compositions and `src/templates/<name>/index.tsx` for layouts with slots. Consume public barrels rather than private implementation files. Keep fetching and application workflows in the host. Use typed inputs and discriminated unions; validate external inputs at boundaries. Preserve null versus zero.

## Naming

| Item                              | Convention                               | Example                               |
| --------------------------------- | ---------------------------------------- | ------------------------------------- |
| Directories and ordinary files    | lowercase kebab-case                     | `date-range-picker`, `chart-model.ts` |
| React components and public types | PascalCase                               | `Chart`, `ChartProps`                 |
| Functions, variables and props    | camelCase; describe their behavior/value | `chartModel`, `onValueChange`         |
| Hooks                             | `use` + meaningful PascalCase name       | `useDebouncedCallback`                |
| Booleans                          | predicate or established native prop     | `hasMore`, `isExpired`, `disabled`    |
| Event callbacks                   | `on` + event                             | `onPageChange`, `onRetry`             |
| Tests and stories                 | colocated `.test.ts(x)` / `.stories.tsx` | `chart.test.tsx`, `chart.stories.tsx` |
| IDs                               | stable consumer/domain identity          | row ID, option value, series ID       |

Use descriptive names rather than temporary project codenames. Preserve established component names and one public name for equivalent controls. Keep domain vocabulary outside the shared kit. Indexes and translated labels must not become row/option identity.

## UI contracts

- Merge caller classes after defaults/state with `cn()`. Rendered public parts expose `className`; meaningful internal slots use typed `classNames`. Do not spread styling maps onto DOM. Preserve existing class targets, refs, native props and consumer `data-testid` forwarding.
- Use shared theme color, spacing, typography, radius, motion and layer tokens. Introduce shared tokens for reusable visual settings instead of scattering magic values.
- Keep UI-owned visible/ARIA/validation defaults in typed i18n catalogs. Explicit text props win; business strings remain consumer-owned. Do not detect navigator language or mutate a global locale.
- Use semantic HTML, accessible names and keyboard/focus behavior. Loading, empty, error, missing and zero are separate states. Keep portal selectors queryable from document/page.
- Follow UI_STORYBOOK.md and the linked authoring standard for public metadata, editable Playground examples, useful galleries, focused behaviors and CustomClasses. Decorative example copy uses lorem ipsum; labels and instructions stay meaningful.

## Formatting and verification

Run `pnpm format` and `pnpm format:check` with the root configuration. Use spaced destructuring and a blank line before return after another statement. Keep controls readable across multiple lines; do not reformat generated icon artwork.

Run checks appropriate to the changed contracts. UI work requires typecheck, meaningful tests and `pnpm build-storybook`; runtime changes also require `pnpm build`. Test normalization, validation and failure/interaction contracts rather than copying the implementation into assertions. Static builds/jsdom tests do not prove browser layout or play execution. Report unverified checks accurately. No lint command is currently configured; do not claim that lint passed.

## Git conventions

See [CONTRIBUTING.md](../CONTRIBUTING.md) for branch names, Conventional Commits and pull request checks. Keep commits focused and review generated output before including it.
