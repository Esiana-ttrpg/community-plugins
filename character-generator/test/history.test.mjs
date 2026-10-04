import test from 'node:test';
import assert from 'node:assert/strict';
import { createState, randomizeUnlocked, rerollField, toggleLock, updateValue } from '../frontend/engine.js';
import { PRESET_BY_ID } from '../frontend/presets.js';
import {
  HISTORY_STORAGE_KEY,
  addGeneratedCharacter,
  deleteCharacter,
  emptyHistory,
  formatCreationDate,
  parseHistory,
  readHistory,
  restoreCharacterState,
  saveCharacter,
  selectCharacter,
  unsaveCharacter,
  updateCurrentCharacter,
  writeHistory,
} from '../frontend/history.js';

const fantasy = PRESET_BY_ID['high-fantasy'];
const generated = (seed = 0) => randomizeUnlocked(fantasy, createState(fantasy), () => seed);
const options = (index) => ({ createId: () => `id-${index}`, now: () => `2026-10-${String(index + 1).padStart(2, '0')}T12:00:00.000Z` });

test('Recent retains only the latest 10 generated characters', () => {
  let history = emptyHistory();
  for (let index = 0; index < 12; index += 1) history = addGeneratedCharacter(history, generated(index / 12), options(index));
  assert.equal(history.recentIds.length, 10);
  assert.deepEqual(history.recentIds.slice(0, 2), ['id-11', 'id-10']);
  assert.equal(history.characters['id-0'], undefined);
});

test('saved characters survive Recent rotation', () => {
  let history = addGeneratedCharacter(emptyHistory(), generated(), options(0));
  history = saveCharacter(history, 'id-0');
  for (let index = 1; index < 13; index += 1) history = addGeneratedCharacter(history, generated(), options(index));
  assert.ok(history.characters['id-0']);
  assert.deepEqual(history.savedIds, ['id-0']);
  assert.equal(history.recentIds.length, 10);
});

test('saving and unsaving moves a character between rail sections', () => {
  let history = addGeneratedCharacter(emptyHistory(), generated(), options(0));
  history = saveCharacter(history, 'id-0');
  assert.deepEqual(history.recentIds, []);
  assert.deepEqual(history.savedIds, ['id-0']);
  history = unsaveCharacter(history, 'id-0');
  assert.deepEqual(history.recentIds, ['id-0']);
  assert.deepEqual(history.savedIds, []);
});

test('deleting removes a character and clears current selection', () => {
  let history = addGeneratedCharacter(emptyHistory(), generated(), options(0));
  history = deleteCharacter(history, 'id-0');
  assert.deepEqual(history.characters, {});
  assert.equal(history.currentId, null);
});

test('loading restores values, locks, preset, and first-name pool without adding history', () => {
  let state = generated();
  state = updateValue(state, 'firstName', 'Elowen');
  state = toggleLock(state, 'firstName');
  state = { ...state, settings: { ...state.settings, firstNamePool: 'femme' } };
  let history = addGeneratedCharacter(emptyHistory(), state, options(0));
  const before = history.recentIds.length;
  history = selectCharacter(history, 'id-0');
  const restored = restoreCharacterState(history.characters['id-0'], fantasy, history.preferences, createState);
  assert.equal(history.recentIds.length, before);
  assert.equal(restored.values.firstName, 'Elowen');
  assert.equal(restored.locked.firstName, true);
  assert.equal(restored.settings.firstNamePool, 'femme');
});

test('rerolls and manual edits update current rather than creating history entries', () => {
  let history = addGeneratedCharacter(emptyHistory(), generated(), options(0));
  let state = rerollField(fantasy, generated(), 'ideal', () => 0.9);
  history = updateCurrentCharacter(history, state, { now: () => '2026-10-03T12:00:00.000Z' });
  state = updateValue(state, 'ideal', 'A hand-written ideal');
  history = updateCurrentCharacter(history, state, { now: () => '2026-10-04T12:00:00.000Z' });
  assert.deepEqual(history.recentIds, ['id-0']);
  assert.equal(history.characters['id-0'].values.ideal, 'A hand-written ideal');
});

test('createdAt remains stable through editing, saving, and unsaving', () => {
  let history = addGeneratedCharacter(emptyHistory(), generated(), options(0));
  const createdAt = history.characters['id-0'].createdAt;
  history = updateCurrentCharacter(history, updateValue(generated(), 'firstName', 'Mira'), { now: () => '2026-11-01T12:00:00.000Z' });
  history = saveCharacter(history, 'id-0');
  history = unsaveCharacter(history, 'id-0');
  assert.equal(history.characters['id-0'].createdAt, createdAt);
});

test('creation dates omit the current year and include previous years', () => {
  const now = new Date('2026-10-02T12:00:00');
  assert.equal(formatCreationDate('2026-10-02T09:00:00', now), 'Oct 2');
  assert.equal(formatCreationDate('2025-10-02T09:00:00', now), 'Oct 2, 2025');
});

test('persisted state survives reload', () => {
  const memory = new Map();
  const storage = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
  const history = addGeneratedCharacter(emptyHistory(), generated(), options(0));
  assert.equal(writeHistory(storage, history), true);
  assert.equal(readHistory(storage).characters['id-0'].presetId, 'high-fantasy');
  assert.ok(memory.has(HISTORY_STORAGE_KEY));
});

test('malformed and outdated local data fail safely', () => {
  assert.deepEqual(parseHistory('{bad json'), emptyHistory());
  assert.deepEqual(parseHistory({ version: 0, characters: { unsafe: {} } }), emptyHistory());
});
