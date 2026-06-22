import { router } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { navigateHomeFromPractice } from './navigateHomeFromPractice';

describe('navigateHomeFromPractice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stops playback, vamp, restores portrait, and navigates home', () => {
    const stopPlayback = jest.fn();
    const stopVamp = jest.fn();

    navigateHomeFromPractice({ stopPlayback, stopVamp });

    expect(stopPlayback).toHaveBeenCalledTimes(1);
    expect(stopVamp).toHaveBeenCalledTimes(1);
    expect(ScreenOrientation.lockAsync).toHaveBeenCalledWith(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    );
    expect(router.replace).toHaveBeenCalledWith('/');
  });
});
