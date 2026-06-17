# Remote Object Storage

Infrastructure plugin for Esiana — registers the `s3-compatible` storage provider (AWS S3, MinIO, Cloudflare R2, Wasabi, DigitalOcean Spaces).

## Runtime deployment (operators)

Installed plugins must contain **only**:

```
remote-object-storage/
  manifest.json
  backend/index.js
  README.md
```

No `node_modules/` or lockfiles under `/app/plugins`. The backend entry is a pre-bundled ESM file with AWS SDK inlined.

## Configuration

1. Install this plugin (Admin → Plugins, or mount under `PLUGINS_DIR`).
2. Enable **Remote Object Storage** in Admin → System Plugins.
3. Set environment variables on the Esiana backend:

| Variable | Required |
|----------|----------|
| `STORAGE_PROVIDER` | `s3-compatible` |
| `S3_BUCKET` | Yes |
| `S3_REGION` | Yes |
| `S3_ACCESS_KEY_ID` | Yes |
| `S3_SECRET_ACCESS_KEY` | Yes |
| `S3_ENDPOINT` | For MinIO, R2, etc. |
| `S3_FORCE_PATH_STYLE` | Auto when endpoint set |

With `STORAGE_PROVIDER=s3-compatible`, the plugin must be **enabled**. If installed but disabled, storage enters **degraded** mode with an Admin warning — Esiana does not silently fall back to filesystem.

## Authoring / rebuild

```bash
npm install
npm run build   # writes backend/index.js via esbuild
```

Commit `backend/index.js` after source changes. Dev-only files (`package.json`, `src/`, `scripts/`) stay in the git repo and are not required at runtime.
