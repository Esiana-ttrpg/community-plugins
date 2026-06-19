#!/usr/bin/env node
/**
 * Pin registry entries that live in this repo to the current git HEAD.
 * External contributor entries (other source.repo values) are left unchanged.
 *
 * Run from community-plugins/ after pushing first-party changes:
 *   node scripts/pin-registry-shas.mjs
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const registryPath = path.join(root, 'registry.json');

const LOCAL_REPO = 'Esiana-ttrpg/community-plugins';

const sha = execSync('git rev-parse HEAD', { cwd: root, encoding: 'utf-8' }).trim();
if (!/^[0-9a-f]{40}$/i.test(sha)) {
  console.error('Invalid git SHA:', sha);
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
let updated = 0;
let skipped = 0;

for (const plugin of registry.plugins ?? []) {
  if (plugin.source?.type !== 'github' || !plugin.source.commitSha) {
    continue;
  }
  if (plugin.source.repo !== LOCAL_REPO) {
    skipped += 1;
    continue;
  }
  plugin.source.commitSha = sha;
  updated += 1;
}

fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Pinned ${updated} first-party plugin(s) to ${sha}`);
if (skipped > 0) {
  console.log(`Skipped ${skipped} external repo entry(ies)`);
}
