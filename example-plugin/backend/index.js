/**
 * Example backend plugin entry.
 * Export `register(router, context)` to attach routes when the plugin is enabled.
 * Routes mount under /api/plugin-runtime/example-plugin/
 */
export function register(router, context) {
  router.get('/hello', (_req, res) => {
    res.json({ message: 'Hello from example-plugin' });
  });

  context.registerDataInterceptor({
    entity: 'wikiPage',
    phase: 'beforeCreate',
    scriptPath: 'hooks/wiki-page-before-create.js',
  });
}
