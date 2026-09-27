# API-key connection example

This campaign plugin demonstrates `registerConnectionProvider` and `context.connections.request`.
Set `ENABLE_PLUGIN_CONNECTION_FIXTURES=true`, then use `fixture-api-key` with Esiana's non-production fixture endpoint.
Core stores and injects the key; the plugin cannot read it. The plugin can nevertheless use the
credential against its declared origin and inspect returned data, so installation and permission
approval confer real authority over the upstream account.
