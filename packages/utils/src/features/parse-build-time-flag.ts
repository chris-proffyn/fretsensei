export function parseBuildTimeFlag(
  raw: string | boolean | undefined,
  defaultValue = false,
): boolean {
  if (raw === undefined || raw === null || raw === '') {
    return defaultValue;
  }

  if (typeof raw === 'boolean') {
    return raw;
  }

  const normalized = raw.trim().toLowerCase();

  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return true;
  }

  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return false;
  }

  return defaultValue;
}
