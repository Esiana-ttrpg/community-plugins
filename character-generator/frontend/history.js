export const HISTORY_SCHEMA_VERSION = 1;
export const HISTORY_STORAGE_KEY = 'esiana.character-generator.history';
export const RECENT_LIMIT = 10;

export function emptyHistory() {
  return {
    version: HISTORY_SCHEMA_VERSION,
    characters: {},
    recentIds: [],
    savedIds: [],
    currentId: null,
    preferences: {
      customFirstNames: [],
      customFirstMode: 'add',
      customLastNames: [],
      customLastMode: 'add',
    },
  };
}

function validCharacter(value) {
  return value && typeof value === 'object'
    && typeof value.id === 'string'
    && typeof value.presetId === 'string'
    && typeof value.createdAt === 'string'
    && !Number.isNaN(Date.parse(value.createdAt))
    && value.values && typeof value.values === 'object' && !Array.isArray(value.values)
    && value.locked && typeof value.locked === 'object' && !Array.isArray(value.locked);
}

function uniqueKnownIds(value, characters) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) => typeof id === 'string' && characters[id]))];
}

function cleanPreferences(value) {
  const fallback = emptyHistory().preferences;
  if (!value || typeof value !== 'object') return fallback;
  return {
    customFirstNames: Array.isArray(value.customFirstNames)
      ? value.customFirstNames.filter((item) => typeof item === 'string')
      : [],
    customFirstMode: value.customFirstMode === 'replace' ? 'replace' : 'add',
    customLastNames: Array.isArray(value.customLastNames)
      ? value.customLastNames.filter((item) => typeof item === 'string')
      : [],
    customLastMode: value.customLastMode === 'replace' ? 'replace' : 'add',
  };
}

export function parseHistory(raw) {
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!value || value.version !== HISTORY_SCHEMA_VERSION || typeof value.characters !== 'object') {
      return emptyHistory();
    }
    const characters = Object.fromEntries(
      Object.entries(value.characters).filter(([, character]) => validCharacter(character)),
    );
    const savedIds = uniqueKnownIds(value.savedIds, characters);
    const saved = new Set(savedIds);
    const recentIds = uniqueKnownIds(value.recentIds, characters)
      .filter((id) => !saved.has(id))
      .slice(0, RECENT_LIMIT);
    const currentId = typeof value.currentId === 'string' && characters[value.currentId]
      ? value.currentId
      : null;
    const referenced = new Set([...recentIds, ...savedIds, ...(currentId ? [currentId] : [])]);
    return {
      version: HISTORY_SCHEMA_VERSION,
      characters: Object.fromEntries(Object.entries(characters).filter(([id]) => referenced.has(id))),
      recentIds,
      savedIds,
      currentId,
      preferences: cleanPreferences(value.preferences),
    };
  } catch {
    return emptyHistory();
  }
}

export function readHistory(storage) {
  try {
    return parseHistory(storage?.getItem(HISTORY_STORAGE_KEY));
  } catch {
    return emptyHistory();
  }
}

export function writeHistory(storage, history) {
  try {
    storage?.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch {
    return false;
  }
}

function snapshot(id, state, timestamp) {
  return {
    id,
    presetId: state.presetId,
    values: { ...state.values },
    locked: { ...state.locked },
    firstNamePool: state.settings.firstNamePool,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function pruneUnreferenced(history) {
  const keep = new Set([
    ...history.recentIds,
    ...history.savedIds,
    ...(history.currentId ? [history.currentId] : []),
  ]);
  return {
    ...history,
    characters: Object.fromEntries(Object.entries(history.characters).filter(([id]) => keep.has(id))),
  };
}

export function addGeneratedCharacter(history, state, options = {}) {
  const timestamp = options.now?.() ?? new Date().toISOString();
  const id = options.createId?.() ?? globalThis.crypto?.randomUUID?.()
    ?? `character-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const recentIds = [id, ...history.recentIds.filter((item) => item !== id)].slice(0, RECENT_LIMIT);
  return pruneUnreferenced({
    ...history,
    characters: { ...history.characters, [id]: snapshot(id, state, timestamp) },
    recentIds,
    currentId: id,
  });
}

export function updateCurrentCharacter(history, state, options = {}) {
  const character = history.currentId ? history.characters[history.currentId] : null;
  if (!character) return history;
  const updatedAt = options.now?.() ?? new Date().toISOString();
  return {
    ...history,
    characters: {
      ...history.characters,
      [character.id]: {
        ...character,
        presetId: state.presetId,
        values: { ...state.values },
        locked: { ...state.locked },
        firstNamePool: state.settings.firstNamePool,
        updatedAt,
      },
    },
  };
}

export function saveCharacter(history, id) {
  if (!history.characters[id]) return history;
  return {
    ...history,
    recentIds: history.recentIds.filter((item) => item !== id),
    savedIds: [id, ...history.savedIds.filter((item) => item !== id)],
  };
}

export function unsaveCharacter(history, id) {
  if (!history.characters[id]) return history;
  const next = {
    ...history,
    savedIds: history.savedIds.filter((item) => item !== id),
    recentIds: [id, ...history.recentIds.filter((item) => item !== id)].slice(0, RECENT_LIMIT),
  };
  return pruneUnreferenced(next);
}

export function deleteCharacter(history, id) {
  if (!history.characters[id]) return history;
  const { [id]: _removed, ...characters } = history.characters;
  return {
    ...history,
    characters,
    recentIds: history.recentIds.filter((item) => item !== id),
    savedIds: history.savedIds.filter((item) => item !== id),
    currentId: history.currentId === id ? null : history.currentId,
  };
}

export function selectCharacter(history, id) {
  return history.characters[id] ? { ...history, currentId: id } : history;
}

export function updatePreferences(history, preferences) {
  return { ...history, preferences: cleanPreferences({ ...history.preferences, ...preferences }) };
}

export function restoreCharacterState(character, preset, preferences, createState) {
  const base = createState(preset, {
    ...preferences,
    firstNamePool: character.firstNamePool,
  });
  return {
    ...base,
    values: Object.fromEntries(Object.keys(base.values).map((key) => [key, typeof character.values[key] === 'string' ? character.values[key] : ''])),
    locked: Object.fromEntries(Object.keys(base.locked).map((key) => [key, character.locked[key] === true])),
  };
}

export function characterLabel(character) {
  const name = [character?.values?.firstName, character?.values?.lastName]
    .map((part) => typeof part === 'string' ? part.trim() : '')
    .filter(Boolean)
    .join(' ');
  return name || 'Unnamed character';
}

export function formatCreationDate(createdAt, now = new Date()) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  }).format(date);
}
