# Empty states

## Presentation

Original inline SVG scenes use the existing theme colors: folder/documents for initial empty, search lens for no results, missing document/window for 404, unavailable server for errors and lock for forbidden. Decorative artwork is hidden from assistive technology, contains no essential text and has no motion or external image requests.

Default states use illustrations and a stronger title hierarchy. Compact states use the same contextual illustration at 144px for table/panel density. An explicit icon prop keeps icon-only presentation. `illustration` replaces the media (`null` gives text-only); an explicit `icon` requests icon presentation. `appearance="plain"` removes the outer panel; `headingLevel` keeps page/panel heading semantics correct. These are generic presentation options, not business screens.

Titles/descriptions explain the state and recovery, while decorative sample content remains lorem ipsum. Host owns real actions and status decisions. No auto navigation, permission inference or provider request is added. EmptyState itself remains server-compatible.

Storybook includes a comparison gallery, initial no-data/action, search/no-results, 404, forbidden, retry, compact, plain and text-only examples. Create/search/retry demos use local state; interaction stories are separate so review stories keep their initial empty/error appearance. No real data is created or sent.

## Verification

Use the colocated stories to review initial, no-results, not-found, forbidden, retry, compact and text-only states. Check keyboard access to recovery actions and overflow at mobile widths. DataTable uses compact illustrations for empty/error states; loading gates empty presentation to avoid a flash.
