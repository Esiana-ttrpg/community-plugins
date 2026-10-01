import assert from 'node:assert/strict';
import test from 'node:test';
import { locatorTarget, normalizeBook, parseLibraryIds } from './grimmory.js';
import { register } from './index.js';

const fixture = {
  id: 742, title: 'The Verdant Codex', subtitle: 'Field Rules for the Crownless Marches',
  authors: ['Nim Adeyemi', 'Rook Vale'], publisher: 'Lantern Table Press', publishedDate: '2025-03-04',
  libraryId: 12, libraryName: 'Pathfinder Rulebooks', thumbnailUrl: '/api/v1/media/book/742/thumbnail', primaryFileType: 'PDF',
};

test('normalizes realistic rulebook metadata without system-specific semantics', () => {
  const result = normalizeBook(fixture);
  assert.deepEqual(result.identity, { providerId: 'grimmory', sourceId: '742' });
  assert.deepEqual(result.metadata.authors, ['Nim Adeyemi', 'Rook Vale']);
  assert.equal(result.metadata.publisher, 'Lantern Table Press');
  assert.equal(result.metadata.year, 2025);
  assert.equal(result.metadata.library, 'Pathfinder Rulebooks');
  assert.equal(result.metadata.kind, 'book');
});

test('filters multiple libraries through one provider configuration', () => {
  assert.deepEqual([...parseLibraryIds('12, 44,12')], ['12', '44']);
  assert.equal(parseLibraryIds('').size, 0);
});

test('maps opaque locator data and friendly page labels to open targets', () => {
  assert.deepEqual(locatorTarget({ label: 'p. 218' }), { key: 'page', value: '218' });
  assert.deepEqual(locatorTarget({ label: 'Travel', data: { section: 'travel-actions' } }), { key: 'locator', value: 'travel-actions' });
});

test('search -> cite -> save -> reload -> resolve -> open', async () => {
  let provider;
  let connectionProvider;
  const requests = [];
  const context = {
    registerConnectionProvider(value) { connectionProvider = value; },
    registerSourceProvider(value) { provider = value; },
    async getCampaignConfig() { return { libraryIds: '12' }; },
    connections: {
      async request(request, url) {
        requests.push({ request, url });
        const body = url.includes('/search?') ? { content: [fixture] } : fixture;
        return { status: 200, body: Buffer.from(JSON.stringify(body)), contentType: 'application/json' };
      },
    },
  };
  register(null, context);
  assert.equal(connectionProvider.auth.type, 'basic');
  const request = {};
  const providerContext = { campaignId: 'marches', userId: 'aya', request, limit: 20, signal: new AbortController().signal };
  const [found] = await provider.searchSources('verdant', providerContext);
  const citation = { payloadVersion: 1, identity: found.identity, metadata: found.metadata, locator: { label: 'p. 218', data: { page: 218 } } };
  const reloaded = JSON.parse(JSON.stringify(citation));
  reloaded.metadata = await provider.resolveSource(reloaded.identity.sourceId, providerContext);
  const opened = await provider.resolveOpenTarget(reloaded.identity.sourceId, reloaded.locator, providerContext);
  assert.equal(reloaded.metadata.title, 'The Verdant Codex');
  assert.equal(opened.url, 'https://grimmory.org/book/742?page=218');
  assert.equal(requests.length, 2);
  assert.ok(requests.every((entry) => entry.request === request));
});
