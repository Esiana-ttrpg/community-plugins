import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createState, randomizeUnlocked } from '../frontend/engine.js';
import { PRESET_BY_ID } from '../frontend/presets.js';
import { CHARACTER_GENERATOR_CSS } from '../frontend/styles.js';
import { addGeneratedCharacter, emptyHistory, saveCharacter } from '../frontend/history.js';
import { historyRailMarkup, register, workbenchMarkup } from '../frontend/index.js';

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
  assert.ok(CHARACTER_GENERATOR_CSS.includes('@media(max-width:900px)'));
  assert.ok(CHARACTER_GENERATOR_CSS.includes('.cg-grid{grid-template-columns:repeat(2,minmax(0,1fr))}'));
  assert.ok(CHARACTER_GENERATOR_CSS.includes('@media(max-width:620px)'));
  assert.ok(CHARACTER_GENERATOR_CSS.includes('.cg-grid{grid-template-columns:1fr}'));
});

test('character rail renders compact Recent and Saved navigation with current state', () => {
  const preset = PRESET_BY_ID['high-fantasy'];
  const state = randomizeUnlocked(preset, createState(preset), () => 0);
  let history = addGeneratedCharacter(emptyHistory(), state, {
    createId: () => 'elowen', now: () => '2026-10-02T12:00:00.000Z',
  });
  history = saveCharacter(history, 'elowen');
  const markup = historyRailMarkup(history);
  assert.match(markup, /Saved/);
  assert.match(markup, /Alden Amberbloom/);
  assert.match(markup, /High Fantasy · Oct 2/);
  assert.match(markup, /aria-current="true"/);
  assert.match(markup, /Stored only in this browser/);
});

test('rail becomes a collapsible region below the desktop breakpoint', () => {
  assert.match(CHARACTER_GENERATOR_CSS, /\.cg-layout\{display:grid;grid-template-columns:13rem minmax\(0,1fr\)/);
  assert.match(CHARACTER_GENERATOR_CSS, /@media\(max-width:900px\).*\.cg-layout\{grid-template-columns:1fr\}/s);
  assert.match(CHARACTER_GENERATOR_CSS, /\.cg-rail\[data-open=true\] \.cg-rail-panel\{display:block\}/);
  assert.match(historyRailMarkup(emptyHistory(), false), /aria-expanded="false"/);
});

test('manifest is global and contains no campaign or storage authority', async () => {
  const manifest = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.scope, 'global');
  assert.deepEqual(manifest.permissions, ['ui:slot']);
  assert.equal(manifest.backendEntry, undefined);
});
