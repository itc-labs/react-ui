# Component class customization

all public UI controls/compositions support direct class customization independently of a theme. UIProvider supports token themes independently of per-instance classes.

## Rules

- Keep existing className targets (Input/Textarea/date picker: control; Select: React Select container; other components: their principal DOM node). Existing rootClassName/contentClassName remain supported.
- New classNames objects expose typed named internal slots. Slot defaults and state styles are merged first, then caller slot classes via cn(). A direct className targeting that same node wins last. No styling map is forwarded to a DOM element.
- Select uses React Select's typed slot names, accepting either a string or a callback with that slot's state, plus field/paging slots. Other slot maps accept strings; use data/ARIA variants for interactive states, or selectedRow/currentPage/currentStep slots where provided.
- Compound components keep className on each rendered part. Headless roots with no DOM have no className. Trigger asChild styling goes on the child; action/header/footer ReactNode slots are styled by their caller.
- Class customization can intentionally replace appearance; it does not replace behavior, validation, IDs, focus refs, selection state or request ownership. Avoid hiding focused content or removing visible focus indicators.

```tsx
<Select
  label="Danh mục"
  options={options}
  classNames={{
    label: 'font-bold text-brand-700',
    control: 'min-h-12 rounded-full',
    option: ({ isSelected }) => isSelected ? 'bg-brand-800' : 'rounded-full',
    menu: 'rounded-panel shadow-overlay',
  }}
/>

<DataTable
  {...tableProps}
  classNames={{
    toolbar: 'bg-brand-50',
    headerCell: 'h-14',
    cell: 'py-5',
    selectedRow: 'bg-brand-100',
    pagination: 'rounded-full border border-line',
  }}
/>
```

## Styling surface audit

| Public API                                 | Customization                                                                                                                                                                                                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Icon, Skeleton                             | Existing native className; Icon keeps Lucide props                                                                                                                                                                                                                                         |
| Button / IconButton                        | className, classNames.root/spinner; IconButton iconClassName                                                                                                                                                                                                                               |
| Tag / Badge                                | Tag: root/icon/label/remove; Badge: root/indicator/label                                                                                                                                                                                                                                   |
| Spinner                                    | root/icon/label slots                                                                                                                                                                                                                                                                      |
| Input / Textarea                           | root/label/required/control/hint/error; existing control className/rootClassName                                                                                                                                                                                                           |
| Select / TimePicker                        | root/label/required/hint/error, all React Select slots (including state callbacks), feedback/optionsError/retry/loadMore/menuFooter/loadingMore                                                                                                                                            |
| Checkbox                                   | root/row/control/indicator/icon/label/required/hint/error                                                                                                                                                                                                                                  |
| Switch                                     | root/control/thumb/label/required; bound field also exposes error                                                                                                                                                                                                                          |
| RadioGroup                                 | root/label/required/group/option/control/indicator/optionLabel/hint/error                                                                                                                                                                                                                  |
| Avatar                                     | root/image/fallback/spinner                                                                                                                                                                                                                                                                |
| Card                                       | root/header/heading/title/description/content/footer; legacy contentClassName                                                                                                                                                                                                              |
| Alert                                      | root/icon/content/title; action node is caller-owned                                                                                                                                                                                                                                       |
| DialogContent / DrawerContent              | content/overlay/close; Title/Description retain className                                                                                                                                                                                                                                  |
| AlertDialogContent                         | content/overlay; cancel/action/title/description styled through compound parts                                                                                                                                                                                                             |
| Popover / DropdownMenu / Tabs / Breadcrumb | Existing className per rendered compound part; DropdownMenuCheckboxItem adds item/indicator/icon slots                                                                                                                                                                                     |
| Tooltip                                    | content className + content/arrow slots; trigger remains caller child                                                                                                                                                                                                                      |
| ToastProvider                              | viewport/toast/icon/content/title/description/close, className targets viewport                                                                                                                                                                                                            |
| Calendar                                   | root/header/navigation/navigationButton/caption/selects/monthSelect/yearSelect/grid; dayClassNames uses DayPicker's typed element/state slots                                                                                                                                              |
| DatePicker / DateRangePicker               | field root/label/required/field/control/icon/value/clear/popover/hint/error; calendarClassNames/dayClassNames reach the nested calendar; range adds footer/summary/draftError/actions/reset/cancel/apply                                                                                   |
| UploadField                                | root/label/required/dropzone/actions/trigger/dropHint/list/file/fileName/fileSize/remove/progress/hint/error; previewTrigger/thumbnail/previewContent/previewOverlay/previewClose/previewTitle/previewDescription/previewBody/previewImage/previewText/download                            |
| AvatarUpload                               | root/label/required/avatarWrapper/avatar/image/fallback/spinner/upload/uploadIcon/uploadText/remove/removeIcon/cropDialog/cropOverlay/cropArea/cropZoom/cropSlider/cropError/cropTitle/cropDescription/cropClose/cropApply/cropCancel/cropActions/hint/error                               |
| Editor                                     | root/label/required/container/toolbar/toolbarButton/toolbarButtonActive/toolbarIcon/content/hint/error; content targets the actual editable surface                                                                                                                                        |
| EmptyState                                 | root/illustration/iconContainer/icon/code/content/title/description/actions                                                                                                                                                                                                                |
| PageHeader                                 | root/content/eyebrow/title/description/actions                                                                                                                                                                                                                                             |
| DataTable                                  | root/toolbar/filter/selection/clearSelection/columnsTrigger/error/retry/scrollArea/table/caption/thead/headerRow/headerCell/sortButton/sortIcon/resizeHandle/tbody/row/selectedRow/cell/selectionCell/checkbox/skeleton/emptyCell/emptyState/footer/summary/pageSize/pageStatus/pagination |
| Pagination                                 | root/button/page/currentPage/ellipsis                                                                                                                                                                                                                                                      |
| Stepper                                    | root/step/currentStep/completedStep/separator/indicator/label                                                                                                                                                                                                                              |
| Tree                                       | root/item/selectedItem/toggle/icon/label/empty                                                                                                                                                                                                                                             |
| Sidebar                                    | root/header/content/footer; group labelClassName, item iconClassName; compound nav/item/submenu className                                                                                                                                                                                  |
| SidebarSubmenuTrigger/Content              | trigger icon/label/chevron slots; contentClassName reaches the inner content wrapper                                                                                                                                                                                                       |
| WorkspaceShell/Body/Header/Main            | className per slot; WorkspaceHeader actionsClassName                                                                                                                                                                                                                                       |
| Form / bound fields                        | Form className; bound fields inherit the underlying control's styling props                                                                                                                                                                                                                |

## CSS and third-party constraints

Calendar library/default CSS lives in the components layer so utilities can override it; default rdp class names are retained when dayClassNames is merged. Select no longer forces control minHeight/menuList maxHeight inline: semantic default classes and caller classes determine them. Editor styling stays in the components layer.

Inline layout/positioning properties used for behavior remain authoritative: table column sizing and Tree depth indentation; Select portal position/z-index; Radix placement and overlay animation lifecycle. Use table sizing state/column definitions, Tree structure, or component placement props for those concerns. Class maps are not arbitrary inline-style objects. Toast viewport positioning/gesture lifecycle is handled by React-Toastify; existing viewport/toast/content/icon/title/description/close targets are retained.

Consumers can import precompiled `@itclabs/react-ui/ui.css` or use Tailwind v4 with the kit theme and a `dist` source scan. Arbitrary caller utilities still need the host Tailwind build. See [consumer setup](../README.md#styles). Icon and token themes are documented in [UI_ICONS.md](UI_ICONS.md) and [UI_TOKENS.md](UI_TOKENS.md).

## Verification

Colocated CustomClasses stories cover controls, major modules, portal overlays, Form bindings and the layout template. Unit tests assert merge precedence on real rendered controls/table/compositions, label/error associations and absence of styling-prop leakage. Existing readable-source tests compile every generated story recipe. Static builds and unit tests do not replace browser visual review or play execution.

Input now adds field/icon/iconRight/endAddon slots; direct className still targets the native input. NumberInput and InputPassword inherit Input slots. InputOTP has root/group/control/slot/activeSlot/caret/label/required/hint/error slots; className targets its visual group and the native overlay uses classNames.control. FormField exposes wrapper className plus root/label/error slots while child control classes/ref are retained. CustomClasses stories cover new surfaces; see UI_INPUTS_FORM.md.

NumberInput additionally exposes stepper/stepperButton classes alongside inherited Input slots. Field roots use content-start (FormField uses self-start) so sibling feedback cannot stretch label/control tracks. Date picker clear-button field geometry stays self-start/flex; caller classes still override last. FieldAlignment demonstrates all sizes and asymmetric feedback.

ModalProvider and per-call options forward className to the composed panel. ModalClassNames preserves overlay slots and adds confirm/cancel/ok/error/icon/accent. Provider defaults merge before per-call classes through cn(); error styles the inline Alert, icon/accent style alert feedback. See [UI_MODAL.md](UI_MODAL.md).

Tag exposes root/icon/label/remove slots; Badge exposes root/indicator/label. Both retain root className. See [Tag and Badge](UI_TAG_BADGE.md).
