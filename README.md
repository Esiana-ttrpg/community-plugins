# Esiana community plugins

Official plugin catalog for [Esiana](https://github.com/Esiana-ttrpg/esiana-core). Esiana core is the **host**; plugin packages live here.

## Catalog (`registry.json`)

Only entries in [`registry.json`](registry.json) appear in Admin → **Sync Registry** discovery. Plugin runtime identity is the manifest `id` — not repo folder path.

Default registry URL:

`https://raw.githubusercontent.com/Esiana-ttrpg/community-plugins/main/registry.json`

| Plugin | Scope | Description |
|--------|-------|-------------|
| [`demo-content-packs`](demo-content-packs/) | global | Create Campaign markdown content packs |
| [`wiki-opds-feed`](wiki-opds-feed/) | campaign | OPDS 1.2 public lore feed |
| [`remote-object-storage`](remote-object-storage/) | global | S3-compatible storage driver registration |

## Examples (`examples/`)

Reference and tutorial packages — **not** in the registry. Install locally via `pnpm run plugins:link` (from `esiana-core`) or Admin → **Install from URL** (raw manifest URL).

| Plugin | Scope | Description |
|--------|-------|-------------|
| [`example-plugin`](examples/example-plugin/) | global | PDK reference — routes, configTemplate, data interceptors |
| [`player-journal`](examples/player-journal/) | campaign | Plugin author tutorial widget |
| [`settlement-life`](examples/settlement-life/) | global | World Development reference plugin |

See [`examples/README.md`](examples/README.md).

## Stubs (`stubs/`)

Placeholder integrations — **not** in the registry. Same local install paths as examples.

| Plugin | Scope | Description |
|--------|-------|-------------|
| [`foundry-vtt-sync`](stubs/foundry-vtt-sync/) | global | Foundry VTT sync placeholder |

See [`stubs/README.md`](stubs/README.md).

## Local development (monorepo)

From `esiana-core`:

```bash
pnpm run plugins:link
```

Copies packages into `esiana-core/plugins/{id}/` (flat — folder layout here is invisible at runtime). Linked packages do **not** appear in the discovery catalog; only `registry.json` does.

Registry sync reads `../community-plugins/registry.json` when the remote fetch fails.

## Pin commit SHAs before release

Registry installs require immutable 40-character git SHAs. After pushing:

```bash
node scripts/pin-registry-shas.mjs
```

Commit the updated `registry.json`.

## Authoring a plugin

See [`examples/example-plugin/manifest.json`](examples/example-plugin/manifest.json) and the Esiana plugin docs in `esiana-core/plugins/README.md`.

Each plugin folder:

```
my-plugin/
  manifest.json
  backend/index.js      # optional
  frontend/index.js     # optional
  hooks/                # optional data interceptors
```

Catalog plugins: add an entry to `registry.json` with `manifestUrl`, `source.repo`, `source.commitSha`, and `source.path`.
