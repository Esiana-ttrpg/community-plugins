# Examples

Reference and tutorial plugins for plugin authors. These packages are **not** listed in [`registry.json`](../registry.json) and do not appear in Admin → Sync Registry.

| Plugin | Scope | Purpose |
|--------|-------|---------|
| [`example-plugin`](example-plugin/) | global | PDK reference — routes, configTemplate, data interceptors |
| [`player-journal`](player-journal/) | campaign | Plugin author tutorial widget |
| [`settlement-life`](settlement-life/) | global | World Development `developmentProvider` reference |

## Local install

From `esiana-core`:

```bash
pnpm run plugins:link
```

Copies each example to `plugins/{id}/` by manifest `id`. Restart the backend after manifest changes.

Alternatively: Admin → Plugins → **Install from URL** with the raw GitHub URL of a package `manifest.json`.

## Identity

Runtime identity is manifest `id` only. Repo paths under `examples/` are organizational — they are not part of plugin identity or discovery.
