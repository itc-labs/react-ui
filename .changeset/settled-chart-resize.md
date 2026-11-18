---
'@itclabs/react-ui': patch
---

Coalesce chart container resize bursts into a final layout update instead of redrawing on every sidebar animation frame. Keep the SVG fitted to the live container, apply reduced-motion resizes immediately, and cancel pending resize work on unmount.
