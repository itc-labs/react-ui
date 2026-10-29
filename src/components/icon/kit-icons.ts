// Only built-in control glyphs belong here. Host-specific names use scoped packs or leaves.
import { UploadIcon as outlineUploadIcon } from './outline/upload';
import { FileIcon as outlineFileIcon } from './outline/file';
import { BoldIcon as outlineBoldIcon } from './outline/bold';
import { ItalicIcon as outlineItalicIcon } from './outline/italic';
import { StrikethroughIcon as outlineStrikethroughIcon } from './outline/strikethrough';
import { HeadingIcon as outlineHeadingIcon } from './outline/heading';
import { ListIcon as outlineListIcon } from './outline/list';
import { ListOrderedIcon as outlineListOrderedIcon } from './outline/list-ordered';
import { QuoteIcon as outlineQuoteIcon } from './outline/quote';
import { UndoIcon as outlineUndoIcon } from './outline/undo';
import { RedoIcon as outlineRedoIcon } from './outline/redo';
import { CalendarIcon as outlineCalendarIcon } from './outline/calendar';
import { MinusIcon as outlineMinusIcon } from './outline/minus';
import { ChevronDownIcon as outlineChevronDownIcon } from './outline/chevron-down';
import { ChevronUpIcon as outlineChevronUpIcon } from './outline/chevron-up';
import { ChevronLeftIcon as outlineChevronLeftIcon } from './outline/chevron-left';
import { ChevronRightIcon as outlineChevronRightIcon } from './outline/chevron-right';
import { FirstIcon as outlineFirstIcon } from './outline/first';
import { LastIcon as outlineLastIcon } from './outline/last';
import { CheckIcon as outlineCheckIcon } from './outline/check';
import { WarningIcon as outlineWarningIcon } from './outline/warning';
import { SuccessIcon as outlineSuccessIcon } from './outline/success';
import { InfoIcon as outlineInfoIcon } from './outline/info';
import { SpinnerIcon as outlineSpinnerIcon } from './outline/spinner';
import { SearchIcon as outlineSearchIcon } from './outline/search';
import { MoreIcon as outlineMoreIcon } from './outline/more';
import { SettingsIcon as outlineSettingsIcon } from './outline/settings';
import { CloseIcon as outlineCloseIcon } from './outline/close';
import { FolderIcon as outlineFolderIcon } from './outline/folder';
import { FolderOpenIcon as outlineFolderOpenIcon } from './outline/folder-open';
import { ViewIcon as outlineViewIcon } from './outline/view';
import { EyeOffIcon as outlineEyeOffIcon } from './outline/eye-off';
import { SortAscendingIcon as outlineSortAscendingIcon } from './outline/sort-ascending';
import { SortDescendingIcon as outlineSortDescendingIcon } from './outline/sort-descending';
import { SortUnsortedIcon as outlineSortUnsortedIcon } from './outline/sort-unsorted';
import { UploadIcon as boldUploadIcon } from './bold/upload';
import { FileIcon as boldFileIcon } from './bold/file';
import { BoldIcon as boldBoldIcon } from './bold/bold';
import { ItalicIcon as boldItalicIcon } from './bold/italic';
import { StrikethroughIcon as boldStrikethroughIcon } from './bold/strikethrough';
import { HeadingIcon as boldHeadingIcon } from './bold/heading';
import { ListIcon as boldListIcon } from './bold/list';
import { ListOrderedIcon as boldListOrderedIcon } from './bold/list-ordered';
import { QuoteIcon as boldQuoteIcon } from './bold/quote';
import { UndoIcon as boldUndoIcon } from './bold/undo';
import { RedoIcon as boldRedoIcon } from './bold/redo';
import { CalendarIcon as boldCalendarIcon } from './bold/calendar';
import { MinusIcon as boldMinusIcon } from './bold/minus';
import { ChevronDownIcon as boldChevronDownIcon } from './bold/chevron-down';
import { ChevronUpIcon as boldChevronUpIcon } from './bold/chevron-up';
import { ChevronLeftIcon as boldChevronLeftIcon } from './bold/chevron-left';
import { ChevronRightIcon as boldChevronRightIcon } from './bold/chevron-right';
import { FirstIcon as boldFirstIcon } from './bold/first';
import { LastIcon as boldLastIcon } from './bold/last';
import { CheckIcon as boldCheckIcon } from './bold/check';
import { WarningIcon as boldWarningIcon } from './bold/warning';
import { SuccessIcon as boldSuccessIcon } from './bold/success';
import { InfoIcon as boldInfoIcon } from './bold/info';
import { SpinnerIcon as boldSpinnerIcon } from './bold/spinner';
import { SearchIcon as boldSearchIcon } from './bold/search';
import { MoreIcon as boldMoreIcon } from './bold/more';
import { SettingsIcon as boldSettingsIcon } from './bold/settings';
import { CloseIcon as boldCloseIcon } from './bold/close';
import { FolderIcon as boldFolderIcon } from './bold/folder';
import { FolderOpenIcon as boldFolderOpenIcon } from './bold/folder-open';
import { ViewIcon as boldViewIcon } from './bold/view';
import { EyeOffIcon as boldEyeOffIcon } from './bold/eye-off';
import { SortAscendingIcon as boldSortAscendingIcon } from './bold/sort-ascending';
import { SortDescendingIcon as boldSortDescendingIcon } from './bold/sort-descending';
import { SortUnsortedIcon as boldSortUnsortedIcon } from './bold/sort-unsorted';

import { defineIconPack } from './registry';

export const kitOutlineIcons = /* @__PURE__ */ defineIconPack('outline', {
  upload: outlineUploadIcon,
  file: outlineFileIcon,
  bold: outlineBoldIcon,
  italic: outlineItalicIcon,
  strikethrough: outlineStrikethroughIcon,
  heading: outlineHeadingIcon,
  list: outlineListIcon,
  listOrdered: outlineListOrderedIcon,
  quote: outlineQuoteIcon,
  undo: outlineUndoIcon,
  redo: outlineRedoIcon,
  calendar: outlineCalendarIcon,
  minus: outlineMinusIcon,
  chevronDown: outlineChevronDownIcon,
  chevronUp: outlineChevronUpIcon,
  chevronLeft: outlineChevronLeftIcon,
  chevronRight: outlineChevronRightIcon,
  first: outlineFirstIcon,
  last: outlineLastIcon,
  check: outlineCheckIcon,
  warning: outlineWarningIcon,
  success: outlineSuccessIcon,
  info: outlineInfoIcon,
  spinner: outlineSpinnerIcon,
  search: outlineSearchIcon,
  // Conventional row/toolbar actions trigger, used by documented DropdownMenu recipes.
  more: outlineMoreIcon,
  settings: outlineSettingsIcon,
  close: outlineCloseIcon,
  folder: outlineFolderIcon,
  folderOpen: outlineFolderOpenIcon,
  view: outlineViewIcon,
  eyeOff: outlineEyeOffIcon,
  sortAscending: outlineSortAscendingIcon,
  sortDescending: outlineSortDescendingIcon,
  sortUnsorted: outlineSortUnsortedIcon,
});

export const kitBoldIcons = /* @__PURE__ */ defineIconPack('bold', {
  upload: boldUploadIcon,
  file: boldFileIcon,
  bold: boldBoldIcon,
  italic: boldItalicIcon,
  strikethrough: boldStrikethroughIcon,
  heading: boldHeadingIcon,
  list: boldListIcon,
  listOrdered: boldListOrderedIcon,
  quote: boldQuoteIcon,
  undo: boldUndoIcon,
  redo: boldRedoIcon,
  calendar: boldCalendarIcon,
  minus: boldMinusIcon,
  chevronDown: boldChevronDownIcon,
  chevronUp: boldChevronUpIcon,
  chevronLeft: boldChevronLeftIcon,
  chevronRight: boldChevronRightIcon,
  first: boldFirstIcon,
  last: boldLastIcon,
  check: boldCheckIcon,
  warning: boldWarningIcon,
  success: boldSuccessIcon,
  info: boldInfoIcon,
  spinner: boldSpinnerIcon,
  search: boldSearchIcon,
  more: boldMoreIcon,
  settings: boldSettingsIcon,
  close: boldCloseIcon,
  folder: boldFolderIcon,
  folderOpen: boldFolderOpenIcon,
  view: boldViewIcon,
  eyeOff: boldEyeOffIcon,
  sortAscending: boldSortAscendingIcon,
  sortDescending: boldSortDescendingIcon,
  sortUnsorted: boldSortUnsortedIcon,
});
