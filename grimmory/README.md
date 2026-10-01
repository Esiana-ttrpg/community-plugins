# Grimmory Source Provider

Connects Esiana citations to books in Grimmory. Application administrators own the username/password connection in **Admin → Plugins**; campaign administrators only enable the plugin and optionally restrict results to a comma-separated set of Grimmory library IDs.

The provider searches Grimmory's app book API, caches normalized title/author/publisher/year/library/thumbnail metadata in each citation, refreshes that metadata by stable book ID, and opens the corresponding Grimmory book with an optional page or section locator. A disconnected provider or deleted book does not erase cached citation metadata.

## Connection requirements

- Authentication: HTTP Basic using a Grimmory integration/OPDS username and password
- Authenticated resources: `https://grimmory.org/api/v1/app/books/**`

All credentialed calls use `context.connections.request()`; the plugin never receives the username or password. Grimmory is commonly self-hosted. This package's origin declaration targets `https://grimmory.org`; a deployment at another origin requires a separately packaged manifest/provider definition for that exact HTTPS origin so Esiana's credential-forwarding allowlist remains closed.

## Test

```sh
node --test backend/grimmory.test.js
```
