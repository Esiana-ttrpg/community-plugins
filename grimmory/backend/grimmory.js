export const GRIMMORY_ORIGIN = 'https://grimmory.org';
export const PLUGIN_ID = 'grimmory';

const text = (value) => typeof value === 'string' && value.trim() ? value.trim() : undefined;
const record = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export function parseLibraryIds(value) {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  return new Set(values.map((entry) => String(entry).trim()).filter(Boolean));
}

export function booksFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  const body = record(payload);
  for (const key of ['content', 'books', 'items', 'results']) if (Array.isArray(body[key])) return body[key];
  return [];
}

export function normalizeBook(value) {
  const book = record(value);
  const id = book.id ?? book.bookId;
  const title = text(book.title);
  if ((typeof id !== 'string' && typeof id !== 'number') || !title) return null;
  const published = text(book.publishedDate ?? book.publishDate ?? book.publicationDate);
  const yearMatch = published?.match(/^(\d{4})/);
  const authors = Array.isArray(book.authors)
    ? book.authors.map((author) => text(typeof author === 'string' ? author : record(author).name)).filter(Boolean)
    : text(book.author) ? [text(book.author)] : undefined;
  const thumbnailPath = text(book.thumbnailUrl ?? book.thumbnail);
  return {
    identity: { providerId: PLUGIN_ID, sourceId: String(id) },
    metadata: {
      title,
      ...(text(book.subtitle) ? { subtitle: text(book.subtitle) } : {}),
      ...(authors?.length ? { authors } : {}),
      ...(text(book.publisher) ? { publisher: text(book.publisher) } : {}),
      ...(yearMatch ? { year: Number(yearMatch[1]) } : {}),
      ...(text(book.libraryName ?? record(book.library).name) ? { library: text(book.libraryName ?? record(book.library).name) } : {}),
      ...(thumbnailPath ? { thumbnail: new URL(thumbnailPath, GRIMMORY_ORIGIN).toString() } : {}),
      kind: 'book',
    },
    libraryId: book.libraryId ?? record(book.library).id,
  };
}

export function locatorTarget(locator) {
  const data = record(locator?.data);
  const page = Number.isInteger(data.page) && data.page > 0 ? data.page : undefined;
  const section = text(data.section ?? data.href ?? data.cfi);
  if (page) return { key: 'page', value: String(page) };
  if (section) return { key: 'locator', value: section };
  const label = text(locator?.label);
  const pageMatch = label?.match(/^(?:p(?:age)?\.?)\s*(\d+)$/i);
  return pageMatch ? { key: 'page', value: pageMatch[1] } : label ? { key: 'locator', value: label } : null;
}

export async function jsonRequest(connections, request, path, signal) {
  const response = await connections.request(request, new URL(path, GRIMMORY_ORIGIN).toString(), {
    method: 'GET', signal, headers: { Accept: 'application/json' },
  });
  if (response.status === 404) return null;
  if (response.status < 200 || response.status >= 300) throw new Error(`Grimmory request failed (${response.status})`);
  return JSON.parse(response.body.toString('utf8'));
}
