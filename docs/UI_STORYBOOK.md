# Storybook authoring

The canonical authoring standard is [STORYBOOK_CONVENTIONS.md](STORYBOOK_CONVENTIONS.md). Follow it for public component metadata, Playground/variant/state galleries, story-purpose tags, CustomClasses and regression visibility.

Navigation orders Docs and Playground first, then galleries and usage examples, with CustomClasses last. The source builder supports metadata-level render recipes and generic public component references. The built `storybook-static/index.json` provides the current inventory; static builds and jsdom tests do not execute browser interactions.
