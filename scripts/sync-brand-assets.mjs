#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'apps/mobile/assets/brand');
const svgSource = path.join(sourceDir, 'ModeWise.svg');
const pngSource = path.join(sourceDir, 'ModeWise_1024.png');
const liteSvgSource = path.join(sourceDir, 'ModeWise_lite.svg');
const litePngSource = path.join(sourceDir, 'ModeWise_lite_1024.png');

const targets = [
  path.join(root, 'assets/brand/ModeWise.svg'),
  path.join(root, 'assets/brand/ModeWise_1024.png'),
  path.join(root, 'assets/brand/ModeWise_lite.svg'),
  path.join(root, 'assets/brand/ModeWise_lite_1024.png'),
  path.join(root, 'apps/web/public/logo.svg'),
  path.join(root, 'apps/web/public/logo-lite.svg'),
  path.join(root, 'apps/mobile/assets/icon.png'),
  path.join(root, 'apps/mobile/assets/adaptive-icon.png'),
  path.join(root, 'apps/mobile/assets/splash-icon.png'),
];

const webIconSizes = [
  { size: 32, file: 'favicon-32.png' },
  { size: 180, file: 'apple-touch-icon.png' },
  { size: 192, file: 'icon-192.png' },
  { size: 512, file: 'icon-512.png' },
];

const webLiteIconSizes = [
  { size: 32, file: 'favicon-32-lite.png' },
  { size: 180, file: 'apple-touch-icon-lite.png' },
  { size: 192, file: 'icon-192-lite.png' },
  { size: 512, file: 'icon-512-lite.png' },
];

function copyBrandAsset(sourcePath, targetPath) {
  mkdirSync(path.dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
}

for (const target of targets) {
  const sourcePath = target.endsWith('.svg')
    ? target.endsWith('logo-lite.svg') || target.endsWith('ModeWise_lite.svg')
      ? liteSvgSource
      : svgSource
    : target.endsWith('splash-icon.png') ||
        target.endsWith('icon.png') ||
        target.endsWith('adaptive-icon.png')
      ? pngSource
      : target.endsWith('ModeWise_lite_1024.png')
        ? litePngSource
        : pngSource;

  copyBrandAsset(sourcePath, target);
  console.log(`Updated ${path.relative(root, target)}`);
}

const webPublicDir = path.join(root, 'apps/web/public');
mkdirSync(webPublicDir, { recursive: true });

if (process.platform !== 'darwin') {
  const missingIcons = webIconSizes.filter(
    ({ file }) => !existsSync(path.join(webPublicDir, file)),
  );

  if (missingIcons.length > 0) {
    console.warn(
      `Skipping web icon resize on ${process.platform}; missing: ${missingIcons
        .map(({ file }) => file)
        .join(', ')}. Run "npm run sync:brand" on macOS or commit apps/web/public/*.png.`,
    );
  }
} else {
  for (const { size, file } of webIconSizes) {
    const output = path.join(webPublicDir, file);
    execSync(`sips -z ${size} ${size} "${pngSource}" --out "${output}"`, {
      stdio: 'ignore',
    });
    console.log(`Updated ${path.relative(root, output)} (${size}x${size})`);
  }

  for (const { size, file } of webLiteIconSizes) {
    const output = path.join(webPublicDir, file);
    execSync(`sips -z ${size} ${size} "${litePngSource}" --out "${output}"`, {
      stdio: 'ignore',
    });
    console.log(`Updated ${path.relative(root, output)} (${size}x${size})`);
  }

  const favicon32 = path.join(webPublicDir, 'favicon-32.png');
  const faviconIco = path.join(webPublicDir, 'favicon.ico');
  if (existsSync(favicon32)) {
    copyFileSync(favicon32, faviconIco);
    console.log(`Updated ${path.relative(root, faviconIco)}`);
  }

  const favicon32Lite = path.join(webPublicDir, 'favicon-32-lite.png');
  const faviconIcoLite = path.join(webPublicDir, 'favicon-lite.ico');
  if (existsSync(favicon32Lite)) {
    copyFileSync(favicon32Lite, faviconIcoLite);
    console.log(`Updated ${path.relative(root, faviconIcoLite)}`);
  }
}

console.log('Brand assets synced from apps/mobile/assets/brand/');

try {
  execSync('node scripts/generate-splash.mjs', {
    cwd: path.join(root, 'apps/mobile'),
    stdio: 'inherit',
  });
} catch (error) {
  console.warn(
    'Skipping mobile splash generation. Run "npm run generate:splash" after updating brand assets.',
  );
  if (error instanceof Error) {
    console.warn(error.message);
  }
}
