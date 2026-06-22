import { router } from 'expo-router';
import { restorePortraitOrientation } from '../hooks/usePracticeOrientation';

export function navigateHomeFromPractice(stopPlayback: () => void) {
  stopPlayback();
  void restorePortraitOrientation();
  router.replace('/');
}
