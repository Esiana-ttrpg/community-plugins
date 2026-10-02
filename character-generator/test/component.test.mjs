import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createState, randomizeUnlocked } from '../frontend/engine.js';
import { PRESET_BY_ID } from '../frontend/presets.js';
import { CHARACTER_GENERATOR_CSS } from '../frontend/styles.js';
import { register, workbenchMarkup } from '../frontend/index.js';

test('registers a global page and global header navigation entry', () => {
  const registrations = { pages: [], headers: [] };
  register({
    registerPage(definition) { registrations.pages.push(definition); },
    registerHeaderPage(definition) { registrations.headers.push(definition); },
  });
  assert.equal(registrations.pages[0].scope, 'global');
  assert.equal(registrations.pages[0].id, 'workbench');
  assert.deepEqual(registrations.headers[0], {
    id: 'character-generator', label: 'Character Generator', icon: 'Sparkles', pageId: 'workbench', scope: 'global',
  });
});

test('workbench renders primary controls, section cards, and per-field actions', () => {
  const preset = PRESET_BY_ID['magical-girl'];
  const state = randomizeUnlocked(preset, createState(preset), () => 0);
  const markup = workbenchMarkup(preset, state);
  assert.match(markup, /Preset/);
  assert.match(markup, /First-name pool/);
  assert.match(markup, /Randomize Unlocked/);
  assert.match(markup, /data-action="lock"/);
  assert.match(markup, /data-action="reroll"/);
  assert.match(markup, /Magical Identity/);
  assert.match(markup, /Custom name sources/);
});

test('responsive styling provides 3, 2, and 1-column section layouts', () => {
  assert.match(CHARACTER_GENERATOR_CSS, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.ok(CHARACTER_GENERATOR_CSS.includes('@media(max-width:900px){.cg-grid{grid-template-columns:repeat(2,minmax(0,1fr))}'));
  assert.ok(CHARACTER_GENERATOR_CSS.includes('@media(max-width:620px)'));
  assert.ok(CHARACTER_GENERATOR_CSS.includes('.cg-grid{grid-template-columns:1fr}'));
});

test('manifest is global and contains no campaign or storage authority', async () => {
  const manifest = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.scope, 'global');
  assert.deepEqual(manifest.permissions, ['ui:slot']);
  assert.equal(manifest.backendEntry, undefined);
});
