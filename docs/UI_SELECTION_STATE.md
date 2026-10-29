# Select remote options and table selection

Select keeps selected labels separate from remote results. DataTable keeps selected IDs separate from the current page. Hosts own fetching and authorization.

## Select contract

- `options` is the current menu result/page accumulation, not the selection store.
- `selectedOptions` supplies labels for initial selected IDs before their page is loaded (edit forms). The control retains only currently selected option labels while mounted; it does not keep all search/page history. Cleared/deselected IDs are pruned. Current result labels take precedence over retained labels. Unknown IDs without labels display their ID; supply selectedOptions for friendly labels.
- `searchable` enables typing. `inputValue` and `onSearchChange` support controlled search. `searchMode="server"` bypasses local filtering; providing onSearchChange also implies server search unless searchMode explicitly says client. Selection/menu close resets the search callback to an empty string.
- `loading` is the initial/search request; `loadingMore` appends data without discarding current choices. `hasMore/onLoadMore` enable menu-bottom loading and a menu footer action, guarded against overlapping triggers. A keyboard-focusable helper outside the listbox offers the same action; the visual footer is excluded from Tab order. Footer lies outside the listbox. Alt+End loads another page without leaving the current search; a screen-reader hint describes the shortcut.
- `optionsError/onRetryOptions` handle option-fetch errors separately from field validation `error`. Retry is explicit. `onMenuOpen/onMenuClose` allow host-owned lazy loading/cancellation.
- Select debounces onSearchChange by default (300 ms, configurable searchDebounceMs); onInputChange is immediate. The host owns loading, page/cursor reset on a new search, result append/dedup, request cancellation and rejection of stale responses. The mock stories cancel stale timers and reset paging on search. The control does not fetch or promise to cancel a host request.
- Controlled values remain authoritative: to clear on record/account/scope change, set value to null/[] or remount the control. Provider-backed values/options must be removed at their host-enforced expiry; selected labels are not permission to retain provider snapshots.

## Table contract

`state.rowSelection` holds stable IDs; changing page, page size, sort or filter does not clear them. The header checkbox selects/deselects only visible page rows. The toolbar shows the total selected IDs and the count on the current page; “Bỏ chọn tất cả” explicitly clears them all.

In server mode, getSelectedRowModel can only return rows present in the supplied page. Do not treat it as all selected records or cache prior page payloads to compensate. Use rowSelection IDs for server/bulk operations; the feature owns authorization, deletion cleanup and clearing selection on dataset/account/scope changes. Selection/visibility/sizing must never enter a BE query key. DataTable stores no old-page row cache.

Stories: Select RemoteSearchAndLoadMore, RemoteMultiSelect, RemoteFailure, RemoteSelectionRetention; DataTable ServerCrossPageSelection and ClientCrossPageSelection. Fixtures make no network/provider calls.

Primary API references: [React Select props](https://react-select.com/props), [TanStack v8 row selection](https://tanstack.com/table/v8/docs/guide/row-selection).

Run the unit suite and the relevant Storybook play functions when changing selection behavior.

## Search debounce update

Select now owns configurable callback debounce (300 ms default). Bind controlled raw input with onInputChange and use onSearchChange for settled search intent; raw input/local filtering stay immediate. Hosts still own HTTP abortion/stale results, page append and selection hydration. See UI_HOOKS.md for reset/IME/load-more semantics and migration from host-only debounce.
