# OAuth connection example

In development, set `ENABLE_PLUGIN_CONNECTION_FIXTURES=true`, configure client ID `fixture-client` with no client secret as a system administrator,
then connect a personal or shared campaign
account. Core performs PKCE, token exchange, refresh, storage, and injection. The plugin never reads
tokens, but it can exercise their authority at declared origins and inspect upstream responses.
