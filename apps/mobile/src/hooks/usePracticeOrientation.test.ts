import * as ScreenOrientation from 'expo-screen-orientation';
import {
  lockLandscapeForPractice,
  restorePortraitOrientation,
} from './usePracticeOrientation';

describe('usePracticeOrientation helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lockLandscapeForPractice requests landscape lock', async () => {
    await lockLandscapeForPractice();

    expect(ScreenOrientation.lockAsync).toHaveBeenCalledWith(
      ScreenOrientation.OrientationLock.LANDSCAPE,
    );
  });

  it('restorePortraitOrientation requests portrait lock', async () => {
    await restorePortraitOrientation();

    expect(ScreenOrientation.lockAsync).toHaveBeenCalledWith(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    );
  });
});
