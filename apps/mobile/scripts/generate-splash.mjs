#!/usr/bin/env node
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const mobileRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const brandDir = path.join(mobileRoot, 'assets/brand');
const outputDir = path.join(mobileRoot, 'assets');

const DPA_BACKGROUND = '#000000';
const MODEWISE_BACKGROUND = '#101317';
const PORTRAIT = { width: 1284, height: 2778 };

const assets = {
  modeWise: path.join(brandDir, 'ModeWise_1024.png'),
  dpaLogo: path.join(brandDir, 'dont-panic-logo.png'),
};

async function buildSolidBackground(color, { width, height }) {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: color,
    },
  })
    .png()
    .toBuffer();
}

async function buildCenteredSplash({
  backgroundColor,
  logoPath,
  logoScale,
  name,
  size,
}) {
  const background = await buildSolidBackground(backgroundColor, size);
  const logo = await sharp(logoPath)
    .resize(Math.round(size.width * logoScale), Math.round(size.width * logoScale), {
      fit: 'inside',
    })
    .png()
    .toBuffer();

  const logoMeta = await sharp(logo).metadata();
  const top = Math.round((size.height - (logoMeta.height ?? 0)) / 2);
  const left = Math.round((size.width - (logoMeta.width ?? 0)) / 2);

  const output = path.join(outputDir, name);
  await sharp(background)
    .composite([{ input: logo, top, left }])
    .png()
    .toFile(output);

  console.log(
    `Generated ${path.relative(mobileRoot, output)} (${size.width}x${size.height})`,
  );
}

mkdirSync(outputDir, { recursive: true });

await buildCenteredSplash({
  backgroundColor: DPA_BACKGROUND,
  logoPath: assets.dpaLogo,
  logoScale: 0.34,
  name: 'splash.png',
  size: PORTRAIT,
});

await buildCenteredSplash({
  backgroundColor: MODEWISE_BACKGROUND,
  logoPath: assets.modeWise,
  logoScale: 0.34,
  name: 'splash-modewise.png',
  size: PORTRAIT,
});

const launchIconSize = 1024;
const launchIcon = await sharp(assets.modeWise)
  .resize(launchIconSize, launchIconSize, { fit: 'inside' })
  .png()
  .toBuffer();

await sharp(launchIcon).toFile(path.join(outputDir, 'splash-icon.png'));
console.log(`Generated assets/splash-icon.png (${launchIconSize}x${launchIconSize})`);
console.log('Mobile splash assets generated from assets/brand/');
