import {
  FIRST_NAME_POOLS,
  createState,
  fieldsForPreset,
  parseCustomList,
  randomizeUnlocked,
  rerollField,
  toggleLock,
  updateValue,
} from './engine.js';
import { PRESETS, PRESET_BY_ID } from './presets.js';
import { CHARACTER_GENERATOR_CSS } from './styles.js';

export const name = 'character-generator';
export const id = 'character-generator';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
  })[character]);
}

function fieldMarkup(field, state) {
  const value = state.values[field.id];
  const locked = state.locked[field.id];
  return `<div class="cg-field" data-field="${escapeHtml(field.id)}" data-locked="${locked}">
    <div>
      <span class="cg-label">${escapeHtml(field.label)}</span>
      <button class="cg-value ${value ? '' : 'cg-placeholder'}" type="button" data-action="edit" title="Edit ${escapeHtml(field.label)}">${escapeHtml(value || 'Choose or write a value')}</button>
    </div>
    <div class="cg-field-actions">
      <button class="cg-btn cg-btn-icon" type="button" data-action="lock" aria-pressed="${locked}" title="${locked ? 'Unlock' : 'Lock'} ${escapeHtml(field.label)}"><span aria-hidden="true">${locked ? '◆' : '◇'}</span><span class="cg-sr">${locked ? 'Unlock' : 'Lock'} ${escapeHtml(field.label)}</span></button>
      <button class="cg-btn cg-btn-icon" type="button" data-action="reroll" title="Reroll ${escapeHtml(field.label)}"><span aria-hidden="true">↻</span><span class="cg-sr">Reroll ${escapeHtml(field.label)}</span></button>
    </div>
  </div>`;
}

function sectionsMarkup(preset, state) {
  return preset.sections.map((section) => `<section class="cg-card">
    <header class="cg-card-head"><h3>${escapeHtml(section.title)}</h3>${section.description ? `<p>${escapeHtml(section.description)}</p>` : ''}</header>
    <div class="cg-fields">${section.fields.map((field) => fieldMarkup(field, state)).join('')}</div>
  </section>`).join('');
}

export function workbenchMarkup(preset, state) {
  return `<div class="cg-app">
    <div class="cg-toolbar" aria-label="Generator controls">
      <label class="cg-control"><span>Preset</span><select class="cg-select" data-control="preset">${PRESETS.map((item) => `<option value="${item.id}" ${item.id === preset.id ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</select></label>
      <label class="cg-control"><span>First-name pool</span><select class="cg-select" data-control="first-name-pool">${FIRST_NAME_POOLS.map((pool) => `<option value="${pool}" ${pool === state.settings.firstNamePool ? 'selected' : ''}>${pool[0].toUpperCase()}${pool.slice(1)}</option>`).join('')}</select></label>
      <div class="cg-actions"><button class="cg-btn cg-btn-primary" type="button" data-control="randomize">Randomize Unlocked</button><button class="cg-btn" type="button" data-control="reset">Reset</button></div>
    </div>
    <div class="cg-intro"><div><span class="cg-kicker">${escapeHtml(preset.eyebrow)}</span><h2>${escapeHtml(preset.name)} concept</h2><p>Shape the details, lock what clicks, and keep exploring.</p></div><span class="cg-kicker">${fieldsForPreset(preset).length} details · ${preset.sections.length} sections</span></div>
    <div class="cg-grid">${sectionsMarkup(preset, state)}</div>
    <details class="cg-custom"><summary>Custom name sources</summary><div class="cg-custom-body">
      ${customListMarkup('first', 'First names', state.settings.customFirstMode, state.settings.customFirstNames)}
      ${customListMarkup('last', 'Last names', state.settings.customLastMode, state.settings.customLastNames)}
    </div></details>
  </div>`;
}

function customListMarkup(kind, label, mode, values) {
  return `<div class="cg-custom-group"><label class="cg-control"><span>${label}</span><textarea class="cg-textarea" data-custom="${kind}" placeholder="One per line or comma-separated">${escapeHtml(values.join('\n'))}</textarea></label><div class="cg-custom-options" role="group" aria-label="${label} behavior"><label><input type="radio" name="${kind}-mode" value="add" ${mode === 'add' ? 'checked' : ''}> Add to built-in</label><label><input type="radio" name="${kind}-mode" value="replace" ${mode === 'replace' ? 'checked' : ''}> Replace built-in</label></div></div>`;
}

function renderWorkbench(root) {
  let preset = PRESETS[0];
  let state = randomizeUnlocked(preset, createState(preset));

  root.innerHTML = `<style>${CHARACTER_GENERATOR_CSS}</style><div data-workbench></div>`;
  const host = root.querySelector('[data-workbench]');

  function paint({ preserveCustomOpen = false } = {}) {
    const wasOpen = preserveCustomOpen && host.querySelector('.cg-custom')?.open;
    host.innerHTML = workbenchMarkup(preset, state);
    if (wasOpen) host.querySelector('.cg-custom').open = true;
  }

  function beginEdit(fieldId) {
    const field = fieldsForPreset(preset).find((item) => item.id === fieldId);
    const row = host.querySelector(`[data-field="${CSS.escape(fieldId)}"]`);
    const button = row?.querySelector('[data-action="edit"]');
    if (!field || !button) return;
    const options = field.generator === 'pronouns' && state.values[fieldId] === 'custom'
      ? null
      : preset.pools[field.generator] ?? field.options;
    const editor = options?.length ? document.createElement('select') : document.createElement('input');
    editor.className = 'cg-value-edit';
    editor.setAttribute('aria-label', `Edit ${field.label}`);
    if (editor.tagName === 'SELECT') {
      const choices = [...new Set([state.values[fieldId], ...options].filter(Boolean))];
      editor.innerHTML = choices.map((option) => `<option ${option === state.values[fieldId] ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('');
    } else {
      editor.value = state.values[fieldId];
    }
    let committed = false;
    let cancelled = false;
    const commit = () => {
      if (committed || cancelled) return;
      committed = true;
      state = updateValue(state, fieldId, editor.value.trim());
      paint();
      if (field.generator === 'pronouns' && editor.value === 'custom') beginEdit(fieldId);
    };
    editor.addEventListener('change', commit, { once: true });
    editor.addEventListener('blur', commit, { once: true });
    editor.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') { event.preventDefault(); editor.blur(); }
      if (event.key === 'Escape') { cancelled = true; paint(); }
    });
    button.replaceWith(editor);
    editor.focus();
  }

  function onClick(event) {
    const control = event.target.closest('[data-control]');
    if (control?.dataset.control === 'randomize') {
      state = randomizeUnlocked(preset, state); paint(); return;
    }
    if (control?.dataset.control === 'reset') {
      const settings = state.settings; state = createState(preset, settings); paint(); return;
    }
    const action = event.target.closest('[data-action]');
    const fieldId = action?.closest('[data-field]')?.dataset.field;
    if (!action || !fieldId) return;
    if (action.dataset.action === 'edit') beginEdit(fieldId);
    if (action.dataset.action === 'lock') { state = toggleLock(state, fieldId); paint(); }
    if (action.dataset.action === 'reroll') { state = rerollField(preset, state, fieldId); paint(); }
  }

  function onChange(event) {
    const target = event.target;
    if (target.matches('[data-control="preset"]')) {
      preset = PRESET_BY_ID[target.value] ?? PRESETS[0];
      state = randomizeUnlocked(preset, createState(preset, state.settings));
      paint();
    } else if (target.matches('[data-control="first-name-pool"]')) {
      state = { ...state, settings: { ...state.settings, firstNamePool: target.value } };
      state = rerollField(preset, state, 'firstName');
      paint();
    } else if (target.matches('[data-custom]')) {
      const key = target.dataset.custom === 'first' ? 'customFirstNames' : 'customLastNames';
      state = { ...state, settings: { ...state.settings, [key]: parseCustomList(target.value) } };
      paint({ preserveCustomOpen: true });
    } else if (target.matches('input[type="radio"]')) {
      const key = target.name === 'first-mode' ? 'customFirstMode' : 'customLastMode';
      state = { ...state, settings: { ...state.settings, [key]: target.value } };
    }
  }

  host.addEventListener('click', onClick);
  host.addEventListener('change', onChange);
  paint();
  return () => {
    host.removeEventListener('click', onClick);
    host.removeEventListener('change', onChange);
  };
}

export function register(registry) {
  registry.registerPage({ id: 'workbench', title: 'Character Generator', scope: 'global', render: renderWorkbench });
  registry.registerHeaderPage({ id: 'character-generator', label: 'Character Generator', icon: 'Sparkles', pageId: 'workbench', scope: 'global' });
}
