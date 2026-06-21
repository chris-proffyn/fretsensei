type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

const enabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';

export function trackEvent(name: string, properties?: AnalyticsProperties) {
  if (!enabled) {
    return;
  }

  if (import.meta.env.DEV) {
    console.debug('[analytics]', name, properties);
  }
}

export function isAnalyticsEnabled() {
  return enabled;
}
