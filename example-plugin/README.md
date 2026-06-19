# Plugin developer quickstart (~30 minutes)

Build a hello-world plugin against a local Esiana instance.

**Docs wiki:** [Campaign model](../../docs/architecture/campaign-model.md) → [Plugin development](../../docs/plugin-development/getting-started.md) → [Hello world](../../docs/plugin-development/hello-world.md)

## Prerequisites

- Esiana core running (`npm run dev` from [esiana-core](../../esiana-core))
- Node 20+
- This repo checked out beside `esiana-core` (monorepo layout)

## 1. Copy the example plugin (5 min)

```bash
cd community-plugins
cp -r example-plugin my-first-plugin
cd my-first-plugin
```

Edit `manifest.json`:

- `id`: unique slug (`my-first-plugin`)
- `name`: display name
- `version`: `0.1.0`

## 2. Link into core (2 min)

From `esiana-core`:

```bash
npm run plugins:link -- ../community-plugins/my-first-plugin
npm run dev:backend
```

Core loads plugins from `plugins/` (symlink target). Restart backend after manifest changes.

## 3. Enable on a campaign (5 min)

1. Log in as GM
2. Campaign Settings → Plugins
3. Enable **Example Plugin** (or your plugin id)
4. Grant capabilities listed in your manifest

## 4. Verify backend hook (5 min)

The example plugin registers a domain event listener. Create or edit a wiki page — check backend logs for the hook firing.

**Runtime route smoke test** (with valid auth token):

```bash
curl -s http://localhost:3001/api/plugin-runtime/example-plugin/hello \
  -H "Authorization: Bearer <token>"
```

See [Events](../../docs/plugin-development/events.md).

## 5. Verify frontend slot (5 min)

If your manifest declares a frontend entry, reload the campaign shell — example slot appears in the sidebar zone declared in `manifest.json`.

See [UI extensions](../../docs/plugin-development/ui-extensions.md).

## 6. Storage API (5 min)

Use `context.storage` in backend hooks for campaign-scoped KV:

```javascript
await context.storage.set('greeting', { hello: 'world' });
```

See [Storage](../../docs/plugin-development/storage.md).

## 7. Manifest reference

| Field | Purpose |
|-------|---------|
| `id` | Stable plugin identifier |
| `capabilities` | Granted powers — see [Capabilities](../../docs/plugin-development/capabilities.md) |
| `backend.entry` | Node module for hooks |
| `frontend.entry` | Vite bundle entry (optional) |
| `events` | Domain event subscriptions |

## Further reading

- [Plugin development catalog](../../docs/plugin-development/README.md)
- [Publishing to registry](../../docs/plugin-development/publishing-to-registry.md)
- [Troubleshooting](../../docs/plugin-development/troubleshooting.md)
- [Capability matrix (appendix)](../../esiana-core/docs/plugins/capability-matrix.md) — shipped vs deferred
- [Security model (engineering)](../../esiana-core/docs/plugins/security-model.md)
- [OpenAPI `/api/docs`](http://localhost:3001/api/docs) — version-locked REST explorer on your running instance

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Plugin not listed | Run `plugins:link`, restart backend, check `plugins/` symlink |
| Hook never fires | Confirm capability + event name match [Events](../../docs/plugin-development/events.md) |
| 403 on API | Use plugin runtime `context.api` or campaign API token with scopes |
