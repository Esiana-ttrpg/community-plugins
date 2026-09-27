# Register a Community Plugin

Use this pull request to add your plugin to the Esiana Community Plugin Registry.

The registry allows Esiana to discover your plugin and make it available to users in-app. Your plugin source can remain in your own repository; this PR only needs to add its registry entry to `registry.json`.

## Plugin

**Plugin name:**  
<!-- Example: My Awesome Plugin -->

**Plugin ID:**  
<!-- Must exactly match the `id` in your manifest.json -->

**Repository:**  
<!-- Example: https://github.com/username/my-esiana-plugin -->

**Manifest URL:**  
<!-- Direct URL to manifest.json -->

**Plugin location:**  
<!-- Path within the repository, if the plugin is not at the repository root. Otherwise use "." -->

## What does your plugin do?

<!-- Briefly describe what the plugin adds to Esiana and its intended use. -->


## Registration checklist

- [ ] My plugin has a valid `manifest.json`.
- [ ] The plugin ID in `registry.json` exactly matches the ID in `manifest.json`.
- [ ] `manifestUrl` points directly to the plugin's `manifest.json`.
- [ ] `source.repo` points to the repository containing the plugin.
- [ ] `source.path` points to the plugin directory within that repository.
- [ ] `commitSha` is a full 40-character commit SHA from that repository.
- [ ] I have reviewed the permissions/capabilities requested by the plugin.
- [ ] This PR adds or updates only the registry entry and does not copy third-party plugin source into this repository.

## Registry entry

<!-- Paste the registry.json entry added or updated by this PR. -->

```json
{
  "id": "",
  "name": "",
  "version": "",
  "description": "",
  "scope": "campaign",
  "category": "",
  "manifestUrl": "",
  "source": {
    "type": "github",
    "repo": "",
    "commitSha": "",
    "path": ""
  },
  "installable": true
}
```

## Maintainer / first-party plugins

<!-- External contributors can ignore this section. -->

- [ ] If plugin package code in this repository changed, ran `node scripts/pin-registry-shas.mjs`.
