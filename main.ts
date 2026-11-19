// Leonida Trophy Atlas — a make.fun program/v1 entry (Node 22, standard library only).
//
// The guide itself is app/: plain static files a browser opens at app/index.html
// (one ES module, one stylesheet, one JSON data file, no build step), fully offline:
// it loads nothing over the network, and its trophy list and guides are
// app/data/trophies.json. This program hands the guide in: it copies app/ and
// screenshots/ from beside this file to /output and writes /output/dossier.json,
// the summary the judge reads (the screenshots, the first load's files and bytes,
// and the source), with the vendored make.fun library.
//
// Leave vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to
// be byte for byte what its own copy of that library writes.
//
// Serve the guide locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The guide (app/) and its screenshots are the whole entry: refuse to hand in
// a half-built output rather than silently copying whatever happens to be there.
const appDir = join(repoRoot, 'app');
const shotsDir = join(repoRoot, 'screenshots');
if (!existsSync(join(appDir, 'index.html'))) throw new Error('app/index.html is missing: the guide is not built');
if (!existsSync(join(appDir, 'data', 'trophies.json'))) throw new Error('app/data/trophies.json is missing: the trophy list is not built');
if (!existsSync(shotsDir)) throw new Error('screenshots/ is missing: take the screenshots first (shoot.py)');

// Copy the guide (app/) and its screenshots into the output directory.
mkdirSync(outDir, { recursive: true });
cpSync(appDir, join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });

// Build the dossier from what was just copied, with the scorer's own caps:
// at most 4 screenshots of 256 KiB each, app/ at most 993 files and 48 MiB,
// the dossier text at most 160 KiB. The scorer refuses anything past these.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

// Say what was handed in, so a local run shows the same summary the grader sees.
// buildDossier returns bytes (a Uint8Array), so decode it before reading it.
const dossierText = new TextDecoder().decode(dossier);
const dossierJson = JSON.parse(dossierText);
const shotCount = dossierJson.images?.length ?? 0;
console.log(`Leonida Trophy Atlas handed in: app/ + ${shotCount} screenshots, dossier ${dossier.length} bytes -> ${outDir}`);
