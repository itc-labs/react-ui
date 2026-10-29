# Component boundaries

Controls with different interaction contracts remain separate. Use Select for single, multiple and searchable choices; Drawer for edge panels; Alert for panel or inline persistent feedback.

## Retained because behavior differs

| Group                                                | Difference                                                                                                                                    |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Button / IconButton                                  | IconButton enforces an accessible name, glyph layout and single-spinner loading; it composes Button.                                          |
| Input / Textarea / Editor                            | Single-line input, multiline plain text and structured rich-text editing.                                                                     |
| Checkbox / Switch / RadioGroup / Select              | Set membership/indeterminate, on/off toggle, visible exclusive choices and dropdown choices.                                                  |
| Calendar / DatePicker / DateRangePicker / TimePicker | Inline calendar, date popup, draft/apply date interval and wall-clock option list; different values/commit behavior.                          |
| Dialog / AlertDialog / Drawer                        | General dialog, confirmation with cancel/action semantics, and edge panel. Shared Radix internals do not make their user contracts identical. |
| Tooltip / Popover / DropdownMenu                     | Noninteractive hint, interactive floating content and keyboard action menu.                                                                   |
| Avatar / AvatarUpload / UploadField                  | Image presentation, avatar-specific edit overlay and general file selection/preview. Composition is intentional.                              |
| Spinner / Skeleton                                   | Indeterminate progress indicator versus layout placeholder.                                                                                   |
| Alert / Toast / EmptyState / Tag                     | Persistent feedback, transient notification, absent-content recovery and compact status label.                                                |
| Card / EmptyState                                    | General content slots versus a specific absent-content presentation.                                                                          |
| Pagination / Stepper / Breadcrumb                    | Dataset page navigation, process progress and location hierarchy.                                                                             |
| Tree / Sidebar submenu                               | Hierarchical item selection versus application navigation.                                                                                    |
| PageHeader / WorkspaceHeader                         | Page title/description/actions versus shell breadcrumb/header slots.                                                                          |
| Form fields / underlying controls                    | Typed binding of value/touched/errors/blur to TanStack Form; not alternate standalone controls.                                               |
