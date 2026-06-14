# Esiana community plugins

Official plugin catalog for [Esiana](https://github.com/Esiana-ttrpg/esiana-core). Esiana core is the **host**; installable packages live here.

**Licensing:** Each plugin is licensed at the **author's choice** — see [`LICENSING.md`](LICENSING.md).

## Catalog

| File | Purpose |
|------|---------|
| [`registry.json`](registry.json) | Multi-plugin catalog for Admin → Sync Registry |
| `{plugin-id}/manifest.json` | Per-plugin manifest |

Default registry URL in Esiana:

`https://raw.githubusercontent.com/Esiana-ttrpg/community-plugins/main/registry.json`

## Published plugins

| Plugin | Scope | Description |
|--------|-------|-------------|
| [`example-plugin`](example-plugin/) | global | PDK reference — routes, configTemplate, data interceptors |
| [`openid-connect`](openid-connect/) | global | OIDC single sign-on |
| [`remote-object-storage`](remote-object-storage/) | global | S3-compatible storage driver registration |
| [`settlement-life`](settlement-life/) | global | World Development reference plugin |
| [`demo-content-packs`](demo-content-packs/) | global | Create Campaign markdown content packs |
| [`campaign-seeder`](campaign-seeder/) | global | QA / demo activity simulator |
| [`player-journal`](player-journal/) | campaign | Plugin author tutorial widget |
| [`wiki-opds-feed`](wiki-opds-feed/) | campaign | OPDS 1.2 public lore feed |

Additional packages (e.g. [`openid-connect`](openid-connect/)) may exist on disk — add to `registry.json` when ready for catalog install.

## Local development (monorepo)

From `esiana-core`:

```bash
npm run plugins:link
```

Copies plugin packages from this repo into `esiana-core/plugins/` for runtime loading. Registry sync also reads `../community-plugins/registry.json` when present.

## Pin commit SHAs before release

Registry installs require immutable 40-character git SHAs. After pushing this repo:

```bash
node scripts/pin-registry-shas.mjs
```

Commit the updated `registry.json`.

## Authoring a plugin

See [`example-plugin/manifest.json`](example-plugin/manifest.json) and the Esiana plugin docs in `esiana-core/plugins/README.md`.

Each plugin folder:

```
my-plugin/
  manifest.json
  backend/index.js      # optional
  frontend/index.js     # optional
  hooks/                # optional data interceptors
```

Add an entry to `registry.json` with `manifestUrl`, `source.repo`, `source.commitSha`, and `source.path`.
