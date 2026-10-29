# UI quality assurance

Use local Storybook fixtures to review presentation and interactions. Examples do not require application services.

## Automated checks

The CI workflow runs on pushes to main and pull requests. It uses the Node version in `.nvmrc`, the pnpm version in `package.json` and a frozen lockfile. It runs format checks, typecheck, unit tests, library build, package verification and Storybook build. Run `pnpm check:contrast` locally for opaque token contrast pairs.

Storybook is deployed by the Vercel GitHub integration (`vercel.json`); pull requests get preview deployments for visual review. No lint command is configured.

The source-builder tests parse and typecheck generated usage recipes. Selector and component tests cover class merging, validation associations, controlled state and lifecycle contracts. Static builds and jsdom tests do not execute browser play functions or prove visual layout.

## Browser review

Run the relevant stories' play functions and inspect:

- Keyboard navigation, accessible names, focus return and nested overlays.
- Loading, empty, error, missing and zero states.
- Long labels and responsive layouts at 390, 768, 1024 and 1440 pixels.
- Theme variants, reduced motion, screen readers and forced colors where relevant.
- Forms with validation, submit state and error focus; tables with selection and pagination.

Record the browser, viewport, stories checked and observed result in the pull request. Keep untested cases explicit. Historical browser results from other checkouts are not evidence for this repository.
