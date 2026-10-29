# UI inventory

Public entry points are defined in [package.json](../package.json). [README.md](../README.md) describes consumer installation and optional peers; [DEVELOPMENT.md](../DEVELOPMENT.md) describes contributor commands.

- `src/components/`: buttons, inputs, choice controls, date/time controls, overlays, navigation, feedback, icons and illustrations.
- `src/modules/`: forms, data tables, sidebar navigation, step progress, empty states and optional rich text, charts and avatar upload.
- `src/templates/`: WorkspaceShell and its layout slots.
- `src/hooks/`: reusable interaction hooks.
- `src/theme/` and `src/i18n/`: tokens, providers and typed defaults.

Components and modules have colocated stories. Overview pages explain setup and composition. Build Storybook and inspect `storybook-static/index.json` for the current story inventory rather than relying on a fixed count.

The core entry excludes optional editor, chart and avatar upload implementations. Use their dedicated subpaths and install their peers only when needed. Interactive entries preserve client boundaries; the root barrel is server-compatible.

See [composition](UI_COMPOSITION_API.md), [layout](UI_LAYOUT.md), [forms](UI_INPUTS_FORM.md), [icons](UI_ICONS.md), [selectors](UI_TESTING.md) and [QA](UI_QA.md) for detailed contracts.
