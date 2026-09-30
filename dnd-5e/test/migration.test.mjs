import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateCollection } from '../frontend/index.js';

const manifest = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));

async function fixture(version) {
  return JSON.parse(await readFile(new URL(`fixtures/${version}-character.json`, import.meta.url), 'utf8'));
}

function provision(existing) {
  const result = structuredClone(existing);
  for (const page of manifest.characterPages) {
    for (const field of page.fields ?? []) {
      if (!Object.hasOwn(result, field.key)) result[field.key] = structuredClone(field.defaultValue ?? null);
    }
  }
  return result;
}

test('0.1.0 singular values survive 0.3.0 field provisioning', async () => {
  const old = await fixture('0.1.0');
  const migrated = provision(old);
  for (const [key, value] of Object.entries(old)) assert.deepEqual(migrated[key], value);
  assert.deepEqual(migrated.spells, { version: 1, entries: [] });
  assert.deepEqual(migrated['spellcasting-sources'], { version: 1, entries: [] });
});

test('0.2.0 collections survive 0.3.0 field provisioning byte-for-value', async () => {
  const old = await fixture('0.2.0');
  const migrated = provision(old);
  for (const key of ['attacks', 'equipment', 'features', 'proficiencies-languages']) {
    assert.deepEqual(migrated[key], old[key]);
    assert.equal(validateCollection(key, migrated[key]), true);
  }
});

test('0.3.0 adds rather than repurposes stable provider keys', async () => {
  const old = await fixture('0.2.0');
  const migrated = provision(old);
  assert.equal(migrated['ability-strength'], 16);
  assert.equal(migrated['spell-slots-3-maximum'], 0);
  assert.equal(migrated['spell-slots-3-remaining'], 0);
  assert.equal(Object.keys(migrated).length, new Set(manifest.characterPages.flatMap((page) => page.fields.map((field) => field.key))).size);
});
