const PLUGIN_ID = 'connection-api-key';

export function register(router, context) {
  context.registerConnectionProvider({
    id: PLUGIN_ID,
    displayName: 'Fixture API key service',
    resourceOrigins: ['http://localhost:3001'],
    auth: { type: 'apiKey', headerName: 'X-Api-Key' },
  });
  router.get('/example/resource', async (req, res) => {
    const response = await context.connections.request(req, 'http://localhost:3001/api/plugin-connection-fixtures/api-key/library', {});
    res.status(response.status).type(response.contentType || 'application/octet-stream').send(response.body);
  });
}
