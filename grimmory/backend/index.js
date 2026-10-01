import { GRIMMORY_ORIGIN, PLUGIN_ID, booksFromPayload, jsonRequest, locatorTarget, normalizeBook, parseLibraryIds } from './grimmory.js';

export function register(_router, context) {
  context.registerConnectionProvider({
    id: PLUGIN_ID,
    displayName: 'Grimmory',
    resourceOrigins: [GRIMMORY_ORIGIN],
    auth: { type: 'basic' },
  });

  context.registerSourceProvider({
    id: PLUGIN_ID,
    displayName: 'Grimmory',
    aliases: ['books', 'library', 'rulebooks'],
    origin: GRIMMORY_ORIGIN,
    capabilities: { locators: true },
    async searchSources(query, providerContext) {
      const config = await context.getCampaignConfig(providerContext.campaignId);
      const libraryIds = parseLibraryIds(config.libraryIds);
      const params = new URLSearchParams({ query, page: '0', size: String(providerContext.limit) });
      const payload = await jsonRequest(context.connections, providerContext.request, `/api/v1/app/books/search?${params}`, providerContext.signal);
      return booksFromPayload(payload).map(normalizeBook).filter((book) => book && (!libraryIds.size || libraryIds.has(String(book.libraryId)))).slice(0, providerContext.limit).map(({ libraryId: _libraryId, ...result }) => result);
    },
    async resolveSource(sourceId, providerContext) {
      if (!/^\d+$/.test(sourceId)) return null;
      const payload = await jsonRequest(context.connections, providerContext.request, `/api/v1/app/books/${encodeURIComponent(sourceId)}`, providerContext.signal);
      const normalized = normalizeBook(payload);
      if (!normalized) return null;
      const config = await context.getCampaignConfig(providerContext.campaignId);
      const libraryIds = parseLibraryIds(config.libraryIds);
      return libraryIds.size && !libraryIds.has(String(normalized.libraryId)) ? null : normalized.metadata;
    },
    async resolveOpenTarget(sourceId, locator) {
      if (!/^\d+$/.test(sourceId)) return null;
      const url = new URL(`/book/${encodeURIComponent(sourceId)}`, GRIMMORY_ORIGIN);
      const target = locatorTarget(locator);
      if (target) url.searchParams.set(target.key, target.value);
      return { type: 'url', url: url.toString() };
    },
  });
}
