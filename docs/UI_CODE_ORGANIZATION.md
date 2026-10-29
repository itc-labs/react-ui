# UI source organization

Split long/complex handwritten components by responsibility while preserving public exports, DOM structure, class slot targets and interactions. Line count is an audit signal, not a requirement to split small readable renderers. Generated icon packs/catalog/SVG files stay generator-owned; splitting repetitive generated maps by hand would add maintenance rather than reduce complexity.

Components separate public contracts, state and rendered parts where complexity warrants it. Inspect each folder for its current internal structure.

The public component/module barrels remain the entry points. Internal part files are not additional public components. Meaningful internal rendered roots accept className; callers continue styling through the existing typed classNames on the public facade. Defaults/state remain before caller classes through cn(). Styling maps are never spread onto DOM.

Preserved behavior includes table controlled state/page-scoped select-all/cross-page IDs, Select retained labels/raw input/debounce/IME/guarded load-more, shared TanStack Form contexts and schemas, editor content/update semantics, file validation/previews/ref focus, date-only values/range apply/cancel, and toast queue/isolation/promise outcomes. React component boundaries may change generated useId strings; label/description links remain internally consistent and no business row/value IDs change.

The obsolete per-vendor icon adapters have been removed. Lucide and Heroicons source packages remain dev dependencies for generator/parity tests, with no production import from the UI kit. Keep registry.ts for typed custom project registration, svg.tsx for native SVG/a11y/class handling, types.ts for public contracts, catalog.ts for search/filter metadata, and sources.json/licenses for provenance and regeneration. See UI_ICONS.md.

Normal notification usage is the browser-only, hook-free toast facade from @itclabs/react-ui/toast. One root ToastProvider attaches it; useToast is optional for local scopes. See UI_TOAST.md for multi-app clients and SSR behavior.

Modal follows the same boundary: types.ts owns contracts, client.ts/client-store.ts the hook-free binding, scope.ts queue/promise/async state, entry.tsx composed-dialog presentation and index.tsx provider/hook wiring. It reuses Dialog and AlertDialog without overlay markup duplication. See UI_MODAL.md.
