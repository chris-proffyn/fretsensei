import { router } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { navigateHomeFromPractice } from './navigateHomeFromPractice';

describe('navigateHomeFromPractice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stops playback, restores portrait, and navigates home', () => {
    const stopPlayback = jest.fn();

    navigateHomeFromPractice(stopPlayback);

    expect(stopPlayback).toHaveBeenCalledTimes(1);
    expect(ScreenOrientation.lockAsync).toHaveBeenCalledWith(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    );
    expect(router.replace).toHaveBeenCalledWith('/');
  });
});
