---
'@itclabs/react-ui': minor
---

Add LanguageSwitcher with flag slots, compact two-language segmented selection and opt-in toggling and a keyboard-accessible multilingual menu. Add controlled ThemeToggle icon, button and sun/moon switch appearances. Add semantic tones for Icon, Button and IconButton, plus soft and outline button variants. Dropdown actions use pointer cursors and retain disabled feedback.

Expose useDataTable, DataTableRoot and DataTablePagination for shared controllers and host-positioned pagination. Add top, bottom, both and external pagination placement, compact top navigation, measured page-height preservation and consistent vertical cell alignment. Existing DataTable use remains supported.

Draw raised Sidebar active-item borders inside their rounded bounds so overflow-clipped navigation regions and groups do not cut their contours.

Add dashed Button/IconButton variants and dashed DropdownMenu entries/submenu triggers, with semantic tone support. Expand consumer utility-class and editor IntelliSense documentation.

Add stateless formatDate, formatCurrency and formatNumber helpers on the server-safe format subpath, with explicit locale/currency/time-zone options and documented missing-value handling.

Add optional Forest, Ocean, Violet, Slate and Ember orange light/dark token presets on the isolated theme/presets entry, with contrast coverage, an interactive guide and reproducible bundle measurements.

Bind UI formatters to UIProvider locale with typed useFormatters defaults and per-call overrides. Add DateFormat presets and custom date-fns pattern support (default dd/MM/yyyy), retaining the Intl options overload and server-safe pure helpers.
