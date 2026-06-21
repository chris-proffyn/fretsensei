import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const mobileRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const constantsPath = path.join(
  mobileRoot,
  'node_modules/react-native-audio-api/common/cpp/audioapi/core/Constants.h',
);

if (!fs.existsSync(constantsPath)) {
  process.exit(0);
}

const content = fs.readFileSync(constantsPath, 'utf8');

if (content.includes('#include <cstddef>')) {
  process.exit(0);
}

if (!content.includes('static constexpr size_t MAX_FFT_SIZE')) {
  console.warn(
    'react-native-audio-api Constants.h layout changed; patch not applied.',
  );
  process.exit(0);
}

const patched = content.replace(
  '#include <cmath>',
  '#include <cstddef>\n#include <cmath>',
);

fs.writeFileSync(constantsPath, patched);
console.log('Patched react-native-audio-api Constants.h for Xcode 26 compatibility.');
