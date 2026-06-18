# Licensing in community-plugins

This repository is a **multi-author plugin catalog**. There is no single license that applies to every file in the repo.

## Author's choice

Each plugin directory is licensed at the **author's discretion**. Before a plugin is listed in [`registry.json`](registry.json), maintainers expect:

1. A `LICENSE` or `LICENSE.md` file in the plugin root (e.g. `my-plugin/LICENSE`), **or**
2. An SPDX license identifier in `manifest.json` (e.g. `"license": "MIT"`) plus a license file when the chosen license requires full text distribution.

Authors retain copyright in their plugin code. Listing in this catalog does not transfer ownership to Esiana.

## Esiana core (separate repo)

[Esiana core](https://github.com/Esiana-ttrpg/esiana-core) is licensed under **AGPL-3.0**. Plugins in this catalog are separate works loaded at runtime; their licenses are independent unless your plugin explicitly states otherwise.

## Registry maintainers

When reviewing a new catalog entry:

- Confirm the plugin folder includes a clear license.
- Do not merge registry entries for plugins without licensing metadata.
- Prefer widely recognized SPDX identifiers in `manifest.json` when authors provide them.

## Example

[`example-plugin/LICENSE`](example-plugin/LICENSE) demonstrates a reference MIT license with `"license": "MIT"` in [`example-plugin/manifest.json`](example-plugin/manifest.json).

For documentation wiki licensing, see the [docs repository](https://github.com/Esiana-ttrpg/docs) (CC BY-SA 4.0).
