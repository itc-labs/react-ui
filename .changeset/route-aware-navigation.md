---
'@itclabs/react-ui': minor
---

Add router-independent matchPath, resolveActiveNav and filterNavByAccess helpers at the root, modules and navigation entries. Sidebar now accepts currentPath, isActive and typed canAccess callbacks, with permission pruning and route-aware branch selection while preserving explicit active overrides.
