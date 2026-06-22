import { router } from 'expo-router';
import { restorePortraitOrientation } from '../hooks/usePracticeOrientation';

interface NavigateHomeFromPracticeOptions {
  stopPlayback: () => void;
  stopVamp?: () => void;
}

export function navigateHomeFromPractice({
  stopPlayback,
  stopVamp,
}: NavigateHomeFromPracticeOptions) {
  stopPlayback();
  stopVamp?.();
  void restorePortraitOrientation();
  router.replace('/');
}
