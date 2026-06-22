import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';

export async function lockLandscapeForPractice() {
  try {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  } catch {
    // Orientation APIs may be unavailable in tests or unsupported environments.
  }
}

export async function restorePortraitOrientation() {
  try {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  } catch {
    // Orientation APIs may be unavailable in tests or unsupported environments.
  }
}

export function usePracticeOrientation() {
  useEffect(() => {
    void lockLandscapeForPractice();

    return () => {
      void restorePortraitOrientation();
    };
  }, []);
}
