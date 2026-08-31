import { defineConfig } from 'tsup'

export default defineConfig({
  // src/index.ts has a top-level await (DB connect-with-retry before
  // serving) — only valid in ESM output. package.json already declares
  // "type": "module" and data-source.ts already relies on import.meta.url,
  // so ESM is what the rest of the codebase assumes too.
  format: ['esm'],
  // Excludes *.spec.ts/*.e2e.ts — no reason to ship test files in the
  // production build.
  entry: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*.e2e.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  noExternal: ['@life-os/auth', '@life-os/env'],
  // dotenv is a real CJS package pulled in transitively via @life-os/env —
  // bundling it produces a broken require("fs") shim in ESM output. Left
  // external, Node's own (correct) CJS interop resolves it at runtime instead.
  external: ['dotenv', 'dotenv-expand'],
})
