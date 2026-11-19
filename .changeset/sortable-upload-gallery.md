---
'@itclabs/react-ui': minor
---

Add optional pointer and keyboard reordering to UploadField galleries and dropzone file lists, via reorder={createUploadReorder()} from @itclabs/react-ui/dnd. Core UploadField has no DnD runtime imports. Gallery onItemsReorder emits the full controlled ID order; dropzone reordering uses onValueChange.
