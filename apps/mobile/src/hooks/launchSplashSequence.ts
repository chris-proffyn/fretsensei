export const DPA_PHASE_MS = 1200;
export const MODEWISE_PHASE_MS = 1200;

export type LaunchSplashPhase = 'dpa' | 'modewise' | null;

export function getNextLaunchSplashPhase(
  phase: Exclude<LaunchSplashPhase, null>,
  elapsedMs: number,
): LaunchSplashPhase {
  if (phase === 'dpa' && elapsedMs >= DPA_PHASE_MS) {
    return 'modewise';
  }

  if (phase === 'modewise' && elapsedMs >= MODEWISE_PHASE_MS) {
    return null;
  }

  return phase;
}
