#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const platform = process.argv[2] ?? 'ios';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(__dirname, '..');

const requiredFiles = [
  'app/index.tsx',
  'src/components/VisualiserScreen.tsx',
  'src/playback/web-audio-engine.ts',
  'src/playback/create-playback-engine.ts',
  'src/playback/expo-av-engine.ts',
  'assets/pluck.wav',
];

for (const relativePath of requiredFiles) {
  const absolutePath = path.join(mobileRoot, relativePath);
  if (!existsSync(absolutePath)) {
    console.error(`Missing required mobile file: ${relativePath}`);
    process.exit(1);
  }
}

const typecheck = spawnSync('npm', ['run', 'typecheck'], {
  cwd: mobileRoot,
  stdio: 'inherit',
});

if (typecheck.status !== 0) {
  process.exit(typecheck.status ?? 1);
}

const tests = spawnSync('npm', ['run', 'test'], {
  cwd: mobileRoot,
  stdio: 'inherit',
});

if (tests.status !== 0) {
  process.exit(tests.status ?? 1);
}

console.log(
  `[smoke:${platform}] Mobile visualiser files, typecheck, and unit smoke tests passed.`,
);
console.log(
  `[smoke:${platform}] Manual simulator/device checks: docs/project/mobile-ios-smoke-test.md (iOS)`,
);
console.log(
  `[smoke:${platform}] Launch options:`,
);
console.log(
  `  • Native:   npm run ios -w @fretsensei/mobile`,
);
console.log(
  `  • Expo Go:  npm run ios:go -w @fretsensei/mobile  (simulator Expo Go must match SDK 52)`,
);
