# Changesets

Every pull request that changes published behaviour adds a changeset:

```sh
pnpm changeset
```

Choose `patch` for fixes, `minor` for new backwards-compatible features and `major` for breaking changes, then describe the change for the changelog. Merging to `main` opens or updates the "Version Packages" pull request; merging that pull request publishes to npm.
