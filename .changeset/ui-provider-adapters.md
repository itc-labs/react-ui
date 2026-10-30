---
'@itclabs/react-ui': minor
---

Accept optional link and image adapters directly on UIProvider, with per-adapter inheritance across nested scopes. Breaking change: remove LinkImageProvider and LinkImageProviderProps from the public API. Migrate `<LinkImageProvider Link={AppLink} Image={AppImage}>` to `<UIProvider link={AppLink} image={AppImage}>` (and update the closing tag). UIProvider is now the only adapter configuration API, including scoped overrides. This breaking change ships as a minor release while the package is 0.x. Update provider recipes and document editor autocomplete and class sorting for classNames.
