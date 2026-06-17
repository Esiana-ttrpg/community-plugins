#!/usr/bin/env node
/**
 * Bundle plugin backend into a single ESM file for zero-dependency deployment.
 * Runtime install requires only manifest.json, backend/index.js, and README.md.
 */
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFile = path.join(root, 'backend', 'index.js');

fs.mkdirSync(path.dirname(outFile), { recursive: true });

await esbuild.build({
  entryPoints: [path.join(root, 'src', 'index.js')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile: outFile,
  external: [],
  banner: {
    js: '/* Bundled infrastructure plugin — do not edit; run npm run build in repo root. */',
  },
});

console.log(`Wrote ${outFile}`);
