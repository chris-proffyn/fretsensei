#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mobileRoot = path.join(root, 'apps/mobile');
const canonicalBrandDir = path.join(root, 'assets/brand');
const mobileBrandDir = path.join(mobileRoot, 'assets/brand');

const MODE_WISE_SVGS = ['ModeWise.svg', 'ModeWise_lite.svg'];

const RASTER_PAIRS = [
  {
    svg: 'ModeWise.svg',
    png: 'ModeWise_1024.png',
    background: { r: 16, g: 19, b: 23, alpha: 1 },
  },
  {
    svg: 'ModeWise_lite.svg',
    png: 'ModeWise_lite_1024.png',
    background: { r: 16, g: 19, b: 23, alpha: 1 },
  },
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

const androidLauncherDensities = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

const iosAppIconPath = path.join(
  mobileRoot,
  'ios/FretSensei/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png',
);

function copyBrandAsset(sourcePath, targetPath) {
  mkdirSync(path.dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
}

function fileHash(filePath) {
  return createHash('md5').update(readFileSync(filePath)).digest('hex');
}

function resolveNewestBrandFile(filename) {
  const candidates = [
    path.join(canonicalBrandDir, filename),
    path.join(mobileBrandDir, filename),
  ].filter((candidate) => existsSync(candidate));

  if (candidates.length === 0) {
    return null;
  }

  return candidates.reduce((newest, candidate) =>
    statSync(candidate).mtimeMs >= statSync(newest).mtimeMs ? candidate : newest,
  );
}

function mirrorModeWiseSvgs() {
  mkdirSync(canonicalBrandDir, { recursive: true });
  mkdirSync(mobileBrandDir, { recursive: true });

  for (const filename of MODE_WISE_SVGS) {
    const sourcePath = resolveNewestBrandFile(filename);
    if (!sourcePath) {
      throw new Error(`Missing brand asset: ${filename}`);
    }

    for (const targetPath of [
      path.join(canonicalBrandDir, filename),
      path.join(mobileBrandDir, filename),
    ]) {
      copyBrandAsset(sourcePath, targetPath);
      console.log(`Updated ${path.relative(root, targetPath)}`);
    }
  }
}

async function buildModeWisePngs() {
  const sharp = (await import('sharp')).default;

  for (const { svg, png, background } of RASTER_PAIRS) {
    const svgPath = path.join(mobileBrandDir, svg);
    const pngTargets = [
      path.join(canonicalBrandDir, png),
      path.join(mobileBrandDir, png),
    ];

    if (!existsSync(svgPath)) {
      const newestPng = resolveNewestBrandFile(png);
      if (!newestPng) {
        throw new Error(`Missing brand asset: ${svg} or ${png}`);
      }

      for (const targetPath of pngTargets) {
        copyBrandAsset(newestPng, targetPath);
        console.log(`Updated ${path.relative(root, targetPath)}`);
      }
      continue;
    }

    const newestPng = resolveNewestBrandFile(png);
    const svgTime = statSync(svgPath).mtimeMs;
    const pngTime = newestPng ? statSync(newestPng).mtimeMs : 0;

    if (newestPng && pngTime > svgTime) {
      for (const targetPath of pngTargets) {
        copyBrandAsset(newestPng, targetPath);
        console.log(`Using hand-authored ${png} for ${path.relative(root, targetPath)}`);
      }
      continue;
    }

    const pngPath = path.join(mobileBrandDir, png);
    await sharp(svgPath)
      .resize(1024, 1024, {
        fit: 'contain',
        background,
      })
      .png()
      .toFile(pngPath);

    copyBrandAsset(pngPath, path.join(canonicalBrandDir, png));
    console.log(`Rasterized ${png} from ${svg}`);
  }
}

function distributeDerivedBrandAssets() {
  const pngSource = path.join(mobileBrandDir, 'ModeWise_1024.png');
  const svgSource = path.join(mobileBrandDir, 'ModeWise.svg');
  const liteSvgSource = path.join(mobileBrandDir, 'ModeWise_lite.svg');

  if (!existsSync(pngSource)) {
    throw new Error('Missing ModeWise_1024.png after brand sync');
  }

  const targets = [
    { source: svgSource, target: path.join(root, 'apps/web/public/logo.svg') },
    {
      source: liteSvgSource,
      target: path.join(root, 'apps/web/public/logo-lite.svg'),
    },
    { source: pngSource, target: path.join(mobileRoot, 'assets/icon.png') },
    {
      source: pngSource,
      target: path.join(mobileRoot, 'assets/adaptive-icon.png'),
    },
    {
      source: pngSource,
      target: path.join(mobileRoot, 'assets/splash-icon.png') },
  ];

  for (const { source, target } of targets) {
    copyBrandAsset(source, target);
    console.log(`Updated ${path.relative(root, target)}`);
  }
}

function syncWebFavicons() {
  const pngSource = path.join(mobileBrandDir, 'ModeWise_1024.png');
  const litePngSource = path.join(mobileBrandDir, 'ModeWise_lite_1024.png');
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
    return;
  }

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
    copyBrandAsset(favicon32, faviconIco);
    console.log(`Updated ${path.relative(root, faviconIco)}`);
  }

  const favicon32Lite = path.join(webPublicDir, 'favicon-32-lite.png');
  const faviconIcoLite = path.join(webPublicDir, 'favicon-lite.ico');
  if (existsSync(favicon32Lite)) {
    copyBrandAsset(favicon32Lite, faviconIcoLite);
    console.log(`Updated ${path.relative(root, faviconIcoLite)}`);
  }
}

async function syncNativeAppIcons() {
  const sharp = (await import('sharp')).default;
  const pngSource = path.join(mobileBrandDir, 'ModeWise_1024.png');
  const androidBackground = { r: 16, g: 19, b: 23, alpha: 1 };
  const sourceHash = fileHash(pngSource);

  copyBrandAsset(pngSource, iosAppIconPath);
  const iosHash = fileHash(iosAppIconPath);
  console.log(
    `Updated iOS app icon ${path.relative(root, iosAppIconPath)} (md5 ${iosHash})`,
  );

  if (sourceHash !== iosHash) {
    throw new Error('iOS app icon copy failed hash verification');
  }

  for (const { folder, size } of androidLauncherDensities) {
    const outputDir = path.join(mobileRoot, 'android/app/src/main/res', folder);
    mkdirSync(outputDir, { recursive: true });

    const resizedIcon = await sharp(pngSource)
      .resize(size, size, {
        fit: 'contain',
        background: androidBackground,
      })
      .webp()
      .toBuffer();

    for (const filename of ['ic_launcher.webp', 'ic_launcher_round.webp']) {
      const outputPath = path.join(outputDir, filename);
      await sharp(resizedIcon).toFile(outputPath);
      console.log(
        `Updated Android app icon ${path.relative(root, outputPath)} (${size}x${size})`,
      );
    }
  }
}

mirrorModeWiseSvgs();
await buildModeWisePngs();
distributeDerivedBrandAssets();
syncWebFavicons();

console.log('Brand assets synced from assets/brand and apps/mobile/assets/brand/');

try {
  await syncNativeAppIcons();
} catch (error) {
  console.warn(
    'Skipping native app icon sync. Run "npm run sync:brand" after installing sharp.',
  );
  if (error instanceof Error) {
    console.warn(error.message);
  }
}

try {
  execSync('node scripts/generate-splash.mjs', {
    cwd: mobileRoot,
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
