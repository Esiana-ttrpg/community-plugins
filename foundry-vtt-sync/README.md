# Foundry VTT Sync

Campaign-scoped Esiana boundary for the `esiana-sync` Foundry VTT module. A global administrator installs the package, then a campaign Game Master enables it in Campaign Settings → Integrations.

The plugin declares only `campaign:sync-content`. Core supplies authenticated, campaign-jailed collection routes below `/api/plugin-runtime/foundry-vtt-sync/content-sync`; the plugin never accesses Core tables directly.

Foundry connects with a user API token carrying `campaign:read` and `campaign:write`. The token user must be a Game Master in the selected campaign. Deletion is intentionally not exposed in v1.

The registry entry remains browse-only until its `source.commitSha` is updated to an immutable commit containing this directory.
