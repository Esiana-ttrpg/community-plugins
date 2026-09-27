# D&D 5e Character Sheet

A campaign-scoped D&D 5e sheet and spellcasting page implemented entirely through Esiana 1.5's published plugin and CharacterField contracts. It does not add 5e-specific behavior to Esiana Core.

## Current scope

The plugin contributes one **5e Character Sheet** character page with persistent fields for:

- six ability scores;
- class, subclass, background, alignment, level, experience, and inspiration;
- armor class and speed;
- current, maximum, and temporary hit points;
- saving-throw and skill proficiency states;
- hit dice, death saves, and senses;
- coinage and an explicit initiative adjustment;
- attacks, equipment, features, and proficiencies/languages.

The separate **Spellcasting** page provides:

- any number of casting sources, each with its own ability and adjustments;
- derived spell attack modifiers and save DCs;
- independently addressable maximum and remaining spell slots for levels 1–9;
- structured cantrips and spells organized from level 0 through level 9.

The plugin intentionally does not enforce spell lists, preparation limits, slot progression, concentration, rests, damage, or healing.

Ability modifiers, proficiency bonus, and initiative are derived in the renderer and are never persisted. Character identity remains canonical Esiana character metadata rather than being duplicated into plugin fields.

Singular values remain independently addressable CharacterFields. Repeatable sheet data uses JSON CharacterFields rather than opaque page-local plugin state.

## JSON collection contracts

Every collection uses the envelope `{ "version": 1, "entries": [...] }`. Every entry has a plugin-generated UUID in `id`.

| Field | Version 1 entry |
|---|---|
| `attacks` | `{ id, name, ability, proficiency, bonus, damage, damageType, notes }` |
| `equipment` | `{ id, name, quantity, equipped, notes }` |
| `features` | `{ id, name, source, description, usesCurrent, usesMaximum, reset }` |
| `proficiencies-languages` | `{ id, name, type, notes }` |
| `spellcasting-sources` | `{ id, name, ability, attackBonus, saveDcBonus, notes }` |
| `spells` | `{ id, name, level, school, sourceId, prepared, ritual, concentration, castingTime, range, components, duration, reference, notes }` |

Allowed attack abilities are the six lowercase ability names. Attack proficiency is `NONE`, `PROFICIENT`, or `EXPERTISE`. Feature reset is `NONE`, `SHORT_REST`, or `LONG_REST`. Proficiency/language type is `LANGUAGE`, `ARMOR`, `WEAPON`, `TOOL`, or `OTHER`.

Spell levels are integers from `0` through `9`; level `0` represents cantrips. `sourceId` is optional as an empty string or references the stable ID of a `spellcasting-sources` entry. Casting sources use one of the six lowercase ability names. Their attack and save-DC adjustments are explicit numeric exceptions applied after the normal ability and proficiency calculation.

Consumers should preserve unknown properties when updating entries so a later compatible plugin release can extend version 1 without discarding data. A future incompatible shape will increment the envelope version and be migrated by the plugin.

## Local installation

From the adjacent `esiana-core` checkout:

```powershell
pnpm run plugins:link -- ../community-plugins/dnd-5e
```

Restart the backend, install the linked plugin as a system administrator, and enable it for a campaign. Open an editable character and select **5e Character Sheet**; Esiana materializes the page and its declared fields on first use.

## API interoperability

The sheet uses the standard campaign-scoped CharacterFields endpoints:

```text
GET /api/campaigns/:campaignHandle/wiki/:characterId/character-fields
PUT /api/campaigns/:campaignHandle/wiki/:characterId/character-fields/:fieldId
```

Provider keys such as `ability-strength`, `combat-ac`, and `hp-current` are stable API identities. Esiana requires provider keys to use lowercase kebab-case.

The renderer refreshes fields when its browser window regains focus and every ten seconds, so updates made through REST are reflected without remounting the page. Focused singular inputs are not overwritten during a refresh.

Esiana 1.5 exposes frontend plugin domain-event subscriptions, but that public subscription surface forwards plugin-originated events only. CharacterField updates are Core-originated, so this release deliberately retains polling instead of depending on Core's internal browser event implementation or requesting a Core change.

## Verification

1. As the character owner, change Strength and current HP; reload and confirm both persist.
2. Read the character's fields through REST and locate them by `pluginId: "dnd-5e"`, `sourceKey: "main-sheet"`, and their provider key.
3. Update a field through REST, return focus to the sheet, and confirm the displayed value and derived output update.
4. As a GM, update the same fields and confirm the owner sees them.
5. Disable the plugin, re-enable it, and confirm the page and all values return unchanged.
6. Create Wizard/Intelligence and Cleric/Wisdom casting sources, verify their derived summaries differ, spend a third-level slot through REST, and confirm the Spellcasting page refreshes it.

## Development tests

```powershell
node --test dnd-5e/test/*.test.mjs
```

Migration fixtures cover persisted `0.1.0` singular fields and all four `0.2.0` JSON collections. Provisioning `0.3.0` adds new defaults without replacing earlier values.

The plugin is not yet listed in `registry.json`. A registry entry must be pinned to a commit that already contains this directory; add and pin that entry after the plugin is committed and pushed.
