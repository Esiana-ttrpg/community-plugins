# Contributing to the plugin registry

## Two contribution paths

### External contributors (plugin stays in your repo)

Your plugin code lives in **your** GitHub repository. This repo only receives a registry entry.

1. Host `manifest.json` at your repo root or under `source.path`.
2. Open a PR that adds **one object** to [`registry.json`](./registry.json) — no plugin source files in the PR.
3. Pin a 40-character `commitSha` from **your** repo (release tag or specific commit).
4. Set `manifestUrl` to the raw GitHub URL of your `manifest.json`.
5. Set `source.repo`, `source.path`, and `source.type: "github"`.
6. Set `installable: true` when SHA-pinned GitHub install is supported.

Example entry:

```json
{
  "id": "acme-wiki-tools",
  "name": "Acme Wiki Tools",
  "version": "1.0.0",
  "description": "Short description for the catalog.",
  "scope": "campaign",
  "category": "wiki",
  "manifestUrl": "https://raw.githubusercontent.com/acme/esiana-wiki-tools/main/manifest.json",
  "source": {
    "type": "github",
    "repo": "acme/esiana-wiki-tools",
    "commitSha": "<40-char-sha-from-your-repo>",
    "path": "."
  },
  "installable": true
}
```

Maintainers review manifest permissions, pinned SHA, and repository trustworthiness.

**GitLab / self-hosted git:** set `"installable": false` for catalog listing only, or document manual install via Admin → Install from URL (global manifest URL).

### Esiana first-party (package in this repo)

**Catalog plugins** live at the repo root and have a matching `registry.json` entry. **Examples** live under `examples/`; **stubs** under `stubs/` — neither appears in the registry until explicitly promoted.

1. Add or update a package directory with `manifest.json`, `README.md`, and runtime entry points.
2. For catalog plugins: add or update the matching entry in `registry.json` with `source.repo: "Esiana-ttrpg/community-plugins"` and top-level `source.path`.
3. Run `node scripts/pin-registry-shas.mjs` to pin first-party SHAs to current `main` HEAD.
4. Commit both the package and updated `registry.json`.

## Registry fields

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | Stable slug; matches `manifest.json` `id` |
| `name`, `version`, `description`, `scope` | yes | Catalog display |
| `category` | recommended | `utility`, `wiki`, `integration`, `dev`, etc. |
| `manifestUrl` | recommended | Raw URL to full manifest |
| `source` | for installable | `type: "github"`, `repo`, `commitSha`, `path` |
| `installable` | optional | `false` for browse-only stubs |

## Version bumps

1. Bump `version` in `manifest.json`.
2. For first-party: push, run `pin-registry-shas.mjs`, commit `registry.json`.
3. For external: contributor supplies new `commitSha` in a registry PR.
4. Operators sync registry and upgrade from Admin.
