import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createState,
  generateField,
  parseCustomList,
  randomizeUnlocked,
  rerollField,
  toggleLock,
  updateValue,
} from '../frontend/engine.js';
import { PRESETS, PRESET_BY_ID } from '../frontend/presets.js';

const fantasy = PRESET_BY_ID['high-fantasy'];

test('all four presets expose distinct, valid section structures', () => {
  assert.deepEqual(PRESETS.map((preset) => preset.name), ['High Fantasy', 'Vampire', 'Magical Girl', 'Space']);
  assert.equal(new Set(PRESETS.map((preset) => preset.sections.map((section) => section.title).join('|'))).size, 4);
  for (const preset of PRESETS) assert.ok(preset.sections.length >= 4);
});

test('global randomization preserves locked values and fills unlocked fields', () => {
  let state = createState(fantasy);
  state = updateValue(state, 'firstName', 'Keep Me');
  state = toggleLock(state, 'firstName');
  const generated = randomizeUnlocked(fantasy, state, () => 0);
  assert.equal(generated.values.firstName, 'Keep Me');
  assert.ok(generated.values.lastName);
  assert.ok(generated.values.clothing);
});

test('individual reroll changes only the requested field', () => {
  const initial = randomizeUnlocked(fantasy, createState(fantasy), () => 0);
  const next = rerollField(fantasy, initial, 'ideal', () => 0.999);
  assert.notEqual(next.values.ideal, initial.values.ideal);
  assert.equal(next.values.firstName, initial.values.firstName);
  assert.deepEqual(next.locked, initial.locked);
});

test('custom first names can augment or replace the selected built-in pool', () => {
  let state = createState(fantasy, { firstNamePool: 'neither', customFirstNames: ['Zephyr'] });
  assert.equal(generateField(fantasy, state, 'firstName', () => 0.999), 'Zephyr');
  state = { ...state, settings: { ...state.settings, customFirstMode: 'replace' } };
  assert.equal(generateField(fantasy, state, 'firstName', () => 0), 'Zephyr');
});

test('custom last names work with preset-specific surname strategies', () => {
  let state = createState(PRESET_BY_ID.vampire, { customLastNames: ['Night-Test'], customLastMode: 'replace' });
  assert.equal(generateField(PRESET_BY_ID.vampire, state, 'lastName', () => 0.5), 'Night-Test');
  state = createState(PRESET_BY_ID.space, { customLastNames: ['Starling'], customLastMode: 'replace' });
  assert.equal(generateField(PRESET_BY_ID.space, state, 'lastName', () => 0), 'Starling');
});

test('dependency hints weight preferred downstream values without excluding alternatives', () => {
  let state = createState(fantasy);
  state = updateValue(state, 'pronouns', 'she/her');
  assert.equal(generateField(fantasy, state, 'clothing', () => 0), 'embroidered traveling coat');
  assert.equal(generateField(fantasy, state, 'clothing', () => 0.999), 'formal tunic with a family crest');
});

test('preset switching starts with the destination schema and preserves name settings', () => {
  const source = createState(fantasy, { firstNamePool: 'femme', customFirstNames: ['Io'] });
  const switched = createState(PRESET_BY_ID.space, source.settings);
  assert.equal(switched.presetId, 'space');
  assert.equal(switched.settings.firstNamePool, 'femme');
  assert.deepEqual(switched.settings.customFirstNames, ['Io']);
  assert.ok('augment' in switched.values);
  assert.equal('ancestry' in switched.values, false);
});

test('custom lists accept lines and commas while removing blanks and duplicates', () => {
  assert.deepEqual(parseCustomList('Ari, Nova\nAri\n\nSol'), ['Ari', 'Nova', 'Sol']);
});
