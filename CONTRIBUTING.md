# Contributing

See [DEVELOPMENT.md](DEVELOPMENT.md) for setup, source structure and verification, and [docs/](docs/) for API contracts and authoring conventions.

Use a branch named `<type>/<short-kebab-case-description>` with one of these prefixes: `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/`, `perf/`, `ci/`.

Use [Conventional Commits](https://www.conventionalcommits.org/), for example `fix(select): preserve focus after dismissal`. Mark breaking changes with `!` and explain the migration.

Before opening a pull request, run formatting, format checks, typecheck, tests, build, package verification, Storybook build and contrast checks as listed in the contributor guide. Describe the problem, resulting behavior and verification. Include browser interaction or visual evidence when relevant, and state any checks you could not run. Keep changes focused and preserve public API, behavior, styling targets and test selectors.

## Changesets

Add a changeset with `pnpm changeset` to every pull request that changes the published package (code, styles, types or packed docs). Pure CI, tests or internal docs changes do not need one. See [DEVELOPMENT.md](DEVELOPMENT.md#releasing).
