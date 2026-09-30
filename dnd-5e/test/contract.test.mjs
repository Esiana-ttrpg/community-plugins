import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  ABILITIES,
  SKILLS,
  abilityModifier,
  derivedModifier,
  normalizeCollection,
  proficiencyBonus,
  signed,
  spellcastingSummary,
  validateCollection,
  validateSpellcastingSources,
  validateSpells,
} from '../frontend/index.js';

const manifest = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
const page = manifest.characterPages[0];

test('manifest targets the Esiana 1.5 plugin contract', () => {
  assert.equal(manifest.scope, 'campaign');
  assert.equal(manifest.engines['esiana-core'], '>=1.5.0');
  assert.equal(page.key, 'main-sheet');
  assert.equal(page.renderMode, 'PLUGIN');
  assert.equal(page.renderer, 'main-sheet');
  assert.equal(manifest.version, '0.3.0');
  assert.equal(manifest.characterPages[1].key, 'spellcasting');
  assert.equal(manifest.characterPages[1].renderer, 'spellcasting');
});

test('spell slots are singular fields and calculations support multiple sources', () => {
  const spellPage = manifest.characterPages.find((item) => item.key === 'spellcasting');
  for (let level = 1; level <= 9; level += 1) {
    assert.equal(spellPage.fields.find((field) => field.key === `spell-slots-${level}-maximum`)?.type, 'NUMBER');
    assert.equal(spellPage.fields.find((field) => field.key === `spell-slots-${level}-remaining`)?.type, 'NUMBER');
  }
  assert.deepEqual(spellcastingSummary({ attackBonus: 1, saveDcBonus: 2 }, 18, 5), { attackModifier: 8, saveDc: 17 });
  assert.deepEqual(spellcastingSummary({ attackBonus: 0, saveDcBonus: 0 }, 16, 9), { attackModifier: 7, saveDc: 15 });
});

test('spellcasting JSON contracts are versioned and externally understandable', () => {
  const sources = { version: 1, entries: [{ id: 'wizard', name: 'Wizard', ability: 'intelligence', attackBonus: 0, saveDcBonus: 0, notes: '' }, { id: 'cleric', name: 'Cleric', ability: 'wisdom', attackBonus: 1, saveDcBonus: 0, notes: '' }] };
  const spells = { version: 1, entries: [{ id: 'spell-fire-bolt', name: 'Fire Bolt', level: 0, school: 'Evocation', sourceId: 'wizard', prepared: true, ritual: false, concentration: false, castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous', reference: 'Player rules', notes: '' }] };
  assert.equal(validateSpellcastingSources(sources), true);
  assert.equal(validateSpells(spells), true);
  assert.equal(validateSpells({ version: 1, entries: [{ ...spells.entries[0], level: 10 }] }), false);
});

test('singular sheet values remain independently addressable CharacterFields', () => {
  const passTwo = [
    'ability-strength', 'ability-dexterity', 'ability-constitution',
    'ability-intelligence', 'ability-wisdom', 'ability-charisma',
    'character-level', 'inspiration', 'combat-ac', 'combat-speed',
    'hp-current', 'hp-maximum', 'hp-temporary',
  ];
  for (const key of passTwo) assert.ok(page.fields.some((field) => field.key === key));
  for (const [ability] of ABILITIES) assert.equal(page.fields.find((field) => field.key === `save-${ability}`)?.type, 'ENUM');
  for (const [skill] of SKILLS) assert.equal(page.fields.find((field) => field.key === `skill-${skill}`)?.type, 'ENUM');
  assert.equal(ABILITIES.length, 6);
  assert.equal(SKILLS.length, 18);
});

test('5e calculations are derived and cover level boundaries', () => {
  assert.equal(abilityModifier(1), -5);
  assert.equal(abilityModifier(10), 0);
  assert.equal(abilityModifier(18), 4);
  assert.equal(proficiencyBonus(1), 2);
  assert.equal(proficiencyBonus(4), 2);
  assert.equal(proficiencyBonus(5), 3);
  assert.equal(proficiencyBonus(17), 6);
  assert.equal(signed(0), '+0');
  assert.equal(signed(-2), '-2');
  assert.equal(derivedModifier(16, 'NONE', 5), 3);
  assert.equal(derivedModifier(16, 'PROFICIENT', 5), 6);
  assert.equal(derivedModifier(16, 'EXPERTISE', 5), 9);
});

test('repeatable fields use documented versioned collection envelopes', () => {
  const collections = Object.fromEntries(page.fields.filter((field) => field.type === 'JSON').map((field) => [field.key, field.defaultValue]));
  assert.deepEqual(Object.keys(collections), ['attacks', 'equipment', 'features', 'proficiencies-languages']);
  for (const value of Object.values(collections)) assert.deepEqual(value, { version: 1, entries: [] });
  assert.deepEqual(normalizeCollection(null), { version: 1, entries: [] });
  assert.equal(validateCollection('attacks', { version: 1, entries: [{ id: 'attack-1', name: 'Longsword', ability: 'strength', proficiency: 'PROFICIENT', bonus: 0, damage: '1d8+3', damageType: 'slashing', notes: '' }] }), true);
  assert.equal(validateCollection('attacks', { version: 1, entries: [{ name: 'No stable id' }] }), false);
  assert.equal(validateCollection('attacks', { version: 1, entries: [{ id: 'attack-2', name: 'Invalid', ability: 'luck', proficiency: 'PROFICIENT', bonus: 0, damage: '', damageType: '', notes: '' }] }), false);
  assert.equal(validateCollection('equipment', { version: 1, entries: [{ id: 'item-1', name: 'Rope', quantity: 1, equipped: false, notes: '' }] }), true);
  assert.equal(validateCollection('features', { version: 1, entries: [{ id: 'feature-1', name: 'Second Wind', source: 'Fighter', description: '', usesCurrent: 1, usesMaximum: 1, reset: 'SHORT_REST' }] }), true);
  assert.equal(validateCollection('proficiencies-languages', { version: 1, entries: [{ id: 'language-1', name: 'Common', type: 'LANGUAGE', notes: '' }] }), true);
});
