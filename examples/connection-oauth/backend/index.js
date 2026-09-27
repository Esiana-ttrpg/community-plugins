const PLUGIN_ID = 'connection-oauth';

export function register(router, context) {
  context.registerConnectionProvider({
    id: PLUGIN_ID,
    displayName: 'Fixture OAuth service',
    resourceOrigins: ['http://localhost:3001'],
    auth: {
      type: 'oauth2',
      authorizationUrl: 'http://localhost:3001/api/plugin-connection-fixtures/oauth/authorize',
      tokenUrl: 'http://localhost:3001/api/plugin-connection-fixtures/oauth/token',
      revocationUrl: 'http://localhost:3001/api/plugin-connection-fixtures/oauth/revoke',
      scopes: ['library.read'],
      clientAuth: 'none'
    },
  });
  router.get('/example/library', async (req, res) => {
    const response = await context.connections.request(req, 'http://localhost:3001/api/plugin-connection-fixtures/oauth/library', {});
    res.status(response.status).type(response.contentType || 'application/octet-stream').send(response.body);
  });
}
