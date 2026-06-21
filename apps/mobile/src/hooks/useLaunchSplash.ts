import * as ScreenOrientation from 'expo-screen-orientation';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import {
  DPA_PHASE_MS,
  MODEWISE_PHASE_MS,
  type LaunchSplashPhase,
} from './launchSplashSequence';

export type { LaunchSplashPhase } from './launchSplashSequence';

async function lockPortraitForLaunch() {
  try {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  } catch {
    // Orientation APIs may be unavailable in tests or unsupported environments.
  }
}

async function lockLandscapeForApp() {
  try {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  } catch {
    // Orientation APIs may be unavailable in tests or unsupported environments.
  }
}

export function useLaunchSplash() {
  const [phase, setPhase] = useState<LaunchSplashPhase>('dpa');
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {
      // Native splash may already be hidden in tests or unsupported environments.
    });
  }, []);

  useEffect(() => {
    if (phase === 'dpa' || phase === 'modewise') {
      void lockPortraitForLaunch();
      return;
    }

    if (appReady) {
      void lockLandscapeForApp();
    }
  }, [phase, appReady]);

  useEffect(() => {
    if (!appReady) {
      return undefined;
    }

    let cancelled = false;
    let dpaTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let modeWiseTimeoutId: ReturnType<typeof setTimeout> | undefined;

    async function startSequence() {
      try {
        await SplashScreen.hideAsync();
      } catch {
        // Ignore when the native splash is unavailable.
      }

      if (cancelled) {
        return;
      }

      setPhase('dpa');

      dpaTimeoutId = setTimeout(() => {
        if (cancelled) {
          return;
        }

        setPhase('modewise');

        modeWiseTimeoutId = setTimeout(() => {
          if (!cancelled) {
            setPhase(null);
          }
        }, MODEWISE_PHASE_MS);
      }, DPA_PHASE_MS);
    }

    void startSequence();

    return () => {
      cancelled = true;
      if (dpaTimeoutId) {
        clearTimeout(dpaTimeoutId);
      }
      if (modeWiseTimeoutId) {
        clearTimeout(modeWiseTimeoutId);
      }
    };
  }, [appReady]);

  const onLayoutReady = useCallback(() => {
    setAppReady(true);
  }, []);

  return {
    phase,
    onLayoutReady,
  };
}
