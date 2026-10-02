export const FIRST_NAME_POOLS = Object.freeze(['masc', 'femme', 'neither', 'both']);

function choose(items, random) {
  if (!items.length) return '';
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}

function weightedChoose(items, random) {
  const normalized = items.map((item) =>
    typeof item === 'string' ? { value: item, weight: 1 } : item,
  );
  const total = normalized.reduce((sum, item) => sum + Math.max(0, item.weight ?? 1), 0);
  if (total <= 0) return normalized[0]?.value ?? '';
  let cursor = random() * total;
  for (const item of normalized) {
    cursor -= Math.max(0, item.weight ?? 1);
    if (cursor < 0) return item.value;
  }
  return normalized.at(-1)?.value ?? '';
}

export function fieldsForPreset(preset) {
  return preset.sections.flatMap((section) => section.fields);
}

export function validatePreset(preset) {
  if (!preset?.id || !preset?.name || !Array.isArray(preset.sections)) {
    throw new Error('Preset requires id, name, and sections.');
  }
  const ids = new Set();
  for (const field of fieldsForPreset(preset)) {
    if (!field.id || !field.label || !field.generator) {
      throw new Error(`Invalid field in preset ${preset.id}.`);
    }
    if (ids.has(field.id)) throw new Error(`Duplicate field id: ${field.id}`);
    ids.add(field.id);
    for (const dependency of field.dependsOn ?? []) {
      if (!ids.has(dependency)) {
        throw new Error(`${field.id} must appear after dependency ${dependency}.`);
      }
    }
  }
  return preset;
}

export function createState(preset, settings = {}) {
  return {
    presetId: preset.id,
    values: Object.fromEntries(fieldsForPreset(preset).map((field) => [field.id, ''])),
    locked: Object.fromEntries(fieldsForPreset(preset).map((field) => [field.id, false])),
    settings: {
      firstNamePool: settings.firstNamePool ?? 'both',
      customFirstNames: settings.customFirstNames ?? [],
      customFirstMode: settings.customFirstMode ?? 'add',
      customLastNames: settings.customLastNames ?? [],
      customLastMode: settings.customLastMode ?? 'add',
    },
  };
}

function namePool(preset, settings) {
  const builtIn = settings.firstNamePool === 'both'
    ? [...preset.names.first.masc, ...preset.names.first.femme]
    : preset.names.first[settings.firstNamePool] ?? preset.names.first.neither;
  return settings.customFirstMode === 'replace' && settings.customFirstNames.length
    ? settings.customFirstNames
    : [...builtIn, ...settings.customFirstNames];
}

function lastNamePool(preset, settings, random) {
  const strategy = preset.names.last;
  let builtIn = [];
  if (strategy.type === 'complete') builtIn = strategy.values;
  if (strategy.type === 'compound') {
    builtIn = [`${choose(strategy.prefixes, random)}${choose(strategy.suffixes, random)}`];
  }
  if (strategy.type === 'pattern') {
    const pattern = choose(strategy.patterns, random);
    builtIn = [pattern.replaceAll('{root}', choose(strategy.roots, random))];
  }
  return settings.customLastMode === 'replace' && settings.customLastNames.length
    ? settings.customLastNames
    : [...builtIn, ...settings.customLastNames];
}

function optionsFor(field, preset, state, random) {
  if (field.generator === 'firstName') return namePool(preset, state.settings);
  if (field.generator === 'lastName') return lastNamePool(preset, state.settings, random);
  return preset.pools[field.generator] ?? field.options ?? [];
}

function applyHints(options, field, values) {
  const weighted = options.map((option) => ({ value: option, weight: 1 }));
  for (const hint of field.hints ?? []) {
    if (values[hint.field] !== hint.equals) continue;
    for (const item of weighted) {
      if (hint.prefer.includes(item.value)) item.weight *= hint.weight ?? 3;
    }
  }
  return weighted;
}

export function generateField(preset, state, fieldId, random = Math.random) {
  const field = fieldsForPreset(preset).find((candidate) => candidate.id === fieldId);
  if (!field) throw new Error(`Unknown field: ${fieldId}`);
  const options = optionsFor(field, preset, state, random);
  return weightedChoose(applyHints(options, field, state.values), random);
}

export function randomizeUnlocked(preset, state, random = Math.random) {
  const next = { ...state, values: { ...state.values } };
  for (const field of fieldsForPreset(preset)) {
    if (!next.locked[field.id]) {
      next.values[field.id] = generateField(preset, next, field.id, random);
    }
  }
  return next;
}

export function rerollField(preset, state, fieldId, random = Math.random) {
  return {
    ...state,
    values: { ...state.values, [fieldId]: generateField(preset, state, fieldId, random) },
  };
}

export function updateValue(state, fieldId, value) {
  return { ...state, values: { ...state.values, [fieldId]: value } };
}

export function toggleLock(state, fieldId) {
  return { ...state, locked: { ...state.locked, [fieldId]: !state.locked[fieldId] } };
}

export function parseCustomList(value) {
  return [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))];
}
