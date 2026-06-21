import {
  DPA_PHASE_MS,
  MODEWISE_PHASE_MS,
  getNextLaunchSplashPhase,
} from './launchSplashSequence';

describe('launchSplashSequence', () => {
  it('moves from DontPanicApps to ModeWise loading to the app', () => {
    expect(getNextLaunchSplashPhase('dpa', DPA_PHASE_MS)).toBe('modewise');
    expect(getNextLaunchSplashPhase('modewise', MODEWISE_PHASE_MS)).toBe(null);
  });
});
