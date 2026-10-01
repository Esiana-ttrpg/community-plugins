export function register(router, context) {
  router.get('/status', async (req, res) => {
    const campaignId = typeof req.query.campaignId === 'string' ? req.query.campaignId : null;
    res.json({
      status: 'ready',
      pluginId: context.pluginId,
      enabled: campaignId ? await context.isEnabledForCampaign(campaignId) : null,
      apiVersion: 1,
      transport: 'content-sync',
    });
  });
}
