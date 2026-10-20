// Bundles the level data and writes it as JSON for verify.py.
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const cache = join(here, ".cache");
mkdirSync(cache, { recursive: true });

const bundle = join(cache, "levels.mjs");
await build({
  entryPoints: [join(here, "../../src/core/levels/index.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: bundle,
  logLevel: "error",
});

const { TRACKS, getLevels } = await import(pathToFileURL(bundle).href);
const data = Object.fromEntries(TRACKS.map((track) => [track.id, getLevels(track.id)]));
writeFileSync(join(cache, "levels.json"), JSON.stringify(data, null, 1));
