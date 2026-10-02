# Character Generator

A global Esiana app plugin for generating system-neutral character concepts. It is intentionally independent of campaigns and does not import, sync, or save generated characters.

## Features

- High Fantasy, Vampire, Magical Girl, and Space presets
- Data-driven sections, fields, pools, dependencies, and weighted hints
- Masc, Femme, Neither, and Both first-name pools
- Preset-specific surname strategies and custom first/last-name sources
- Locking, individual rerolls, global unlocked randomization, and manual editing
- Responsive section cards: three columns wide, two medium, and one narrow

## Local development

From `esiana-core`, run `pnpm run plugins:link`, restart the backend, and enable **Character Generator** under Admin → Plugins. Open it from the plugin-pages menu in the global app header.

Run the plugin tests from this directory with `npm test` or `node --test test/*.test.mjs`.

## Architecture

`frontend/engine.js` contains the reusable generation state and dependency-ordered randomization. `frontend/presets.js` contains all genre-specific data. `frontend/index.js` registers one global page and its header navigation entry. The plugin requests no campaign or data permissions and makes no API calls.
