---
'@itclabs/react-ui': minor
---

Badge (label) is now Tag; Badge is now the count/dot indicator.

Breaking in 0.x: migrate label-pill JSX and imports from Badge to Tag, and BadgeProps/BadgeTone to TagProps/TagTone. No deprecated alias is provided. Icon names and glyphs containing badge are unchanged.

Tag retains all label tones and adds sm/md sizes, leading/trailing icons, localized removal, keyboard deletion, disabled and selectable/clickable behavior. The new Badge supports counts, max overflow, dots, placements, offsets and localized accessible notification labels. Both expose typed class slots, refs and derived test selectors. See docs/UI_TAG_BADGE.md for migration and API details.
