## Registry entry

- [ ] Adds or updates **one** entry in `registry.json`
- [ ] Does **not** include third-party plugin source (external contributors only)

## Entry details

| Field | Value |
|-------|-------|
| Plugin `id` | |
| `source.repo` | |
| `commitSha` (40-char) | |
| `source.path` | |
| `manifestUrl` | |
| `scope` | global / campaign |
| `installable` | true / false |

## Checklist

- [ ] `manifest.json` `id` matches registry `id`
- [ ] Pinned SHA exists on the declared repo
- [ ] Permissions reviewed (no excessive capabilities)
- [ ] First-party only: ran `node scripts/pin-registry-shas.mjs` if package code changed in this repo
