import assert from 'node:assert/strict';
import test from 'node:test';
import { register } from './index.js';

test('status reports the generic content-sync transport', async () => {
  let handler;
  register({ get(_path, value) { handler = value; } }, {
    pluginId: 'foundry-vtt-sync',
    isEnabledForCampaign: async (id) => id === 'campaign-a',
  });
  const payload = {};
  await handler({ query: { campaignId: 'campaign-a' } }, { json(value) { Object.assign(payload, value); } });
  assert.deepEqual(payload, { status: 'ready', pluginId: 'foundry-vtt-sync', enabled: true, apiVersion: 1, transport: 'content-sync' });
});
