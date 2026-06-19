# community-plugins

Official Esiana plugin catalog and first-party plugin packages.

## What this repo is

| Layer | Location |
|-------|----------|
| **Catalog index** | [`registry.json`](./registry.json) — discoverable plugin entries |
| **First-party packages** | Subdirectories with `manifest.json` (Esiana-maintained) |
| **External plugins** | Listed in `registry.json` only — source stays in contributor repos |

Operators configure Esiana Admin with the registry URL:

```text
https://github.com/Esiana-ttrpg/community-plugins/blob/main/registry.json
```

Esiana normalizes blob links to raw JSON at fetch time. The blob URL is the inspectable source of truth in the UI.

## Plugin Data Model v1

Three layers — do not mix registry discovery with install provenance:

1. **Registry origin** — `registry.json` URL (blob link above)
2. **Registry entry** — each object in `registry.json` with `source.repo`, `commitSha`, `path`
3. **Installed plugin** — runtime artifact in the host's `PLUGINS_DIR` with provenance (`registry`, `manifest-url`, or `local-dev`)

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution paths.

## First-party development

After editing a package under this repo:

```bash
node scripts/pin-registry-shas.mjs
git add registry.json
```

From a sibling `esiana-core` checkout:

```bash
pnpm run plugins:link
```

Restart the backend after manifest changes.

## Further reading

- [Plugin development (docs wiki)](https://github.com/Esiana-ttrpg/docs/tree/main/plugin-development)
- [Publishing to the registry](https://github.com/Esiana-ttrpg/docs/blob/main/plugin-development/publishing-to-registry.md)
