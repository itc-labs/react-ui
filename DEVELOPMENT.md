# Development

Contributor guide for the standalone [@itclabs/react-ui repository](https://github.com/itc-labs/react-ui). Consumer installation, styles, providers and optional peers are documented in [README.md](README.md).

## Setup

Use the Node version in `.nvmrc` (minimum supported: 22.12) and the exact pnpm version declared in `package.json`. From the repository root:

```sh
pnpm install
pnpm storybook
```

Storybook runs at http://127.0.0.1:6006. Use `pnpm install --frozen-lockfile` for reproducible CI setup. Commit intentional dependency changes with their lockfile updates.

## Checks

```sh
pnpm format
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm test:package
pnpm build-storybook
pnpm check:contrast
```

`format` runs Prettier and the function/return spacing formatter. `test` runs Vitest, including generated Storybook recipe compilation. `build` emits ESM, declarations, CSS, fonts and notices into `dist/`. `test:package` validates built export targets, client boundaries, optional dependency isolation, imports, CSS assets and licenses. `build-storybook` writes `storybook-static/`. Contrast checks evaluate opaque theme-token pairs; they do not replace visual accessibility review.

Vitest and Vite caches live under ignored `.cache/`. To place Storybook's own cache there too, run `CACHE_DIR="$PWD/.cache" pnpm storybook` or `CACHE_DIR="$PWD/.cache" pnpm build-storybook`.

Static builds and unit tests do not execute Storybook browser play functions. Run relevant play functions and inspect keyboard focus, overlays, mobile widths and reduced motion when changing interactions. See [QA guidance](docs/UI_QA.md).

## Source and public contracts

- `src/components/`: controls and primitives.
- `src/modules/`: reusable compositions, including Form and DataTable.
- `src/templates/`: generic layouts with slots.
- `src/theme/`, `src/i18n/`, `src/hooks/`: tokens, providers, translations and interaction hooks.
- `src/overview/`: Storybook overview pages and foundation examples.
- `.storybook/`: preview configuration, authoring checks and readable source generation.

Keep public exports, behavior, native props, class targets, refs and test IDs stable. Merge caller classes after defaults with `cn()`. Application workflows, fetching and authorization belong to consumers. Add meaningful tests for behavioral changes and colocate stories with the public entry. Follow [coding conventions](docs/CODING_CONVENTIONS.md) and [Storybook sample-copy conventions](docs/STORYBOOK_CONVENTIONS.md).

## Icons

```sh
pnpm generate:icons
pnpm format
pnpm test
```

The generator reads `src/components/icon/sources.json` and the installed pinned upstream icon packages. It writes native icon leaves, packs, metadata and licenses. Edit the source inventory rather than generated files. See [icon guidance](docs/UI_ICONS.md). `node scripts/measure-icon-bundles.mjs` checks bundle boundaries and reports sizes.

## Package review

The `files` allowlist includes only `dist/`, README, LICENSE, THIRD_PARTY_NOTICES and icon license texts. Contributor guides and `docs/` stay in the repository. The published manifest uses `publishConfig` to map exports to built files; source exports support local development. Heavy editor, chart and avatar upload features remain optional subpaths.

After building, review an actual archive when preparing a release:

```sh
pnpm pack --out /tmp/react-ui-review.tgz
node scripts/verify-package.mjs /tmp/react-ui-review.tgz
```

`prepack` rebuilds the library. Review the archive and changelog before publication.

## Chromatic

Set `CHROMATIC_PROJECT_TOKEN` for your Chromatic project, then run:

```sh
pnpm chromatic
```

This runs `build-storybook` and uploads snapshots. The GitHub workflow reads the same token from repository Actions secrets. Add the resulting public Storybook URL to README after the first build. Snapshot changes require visual review even when the command exits successfully.
