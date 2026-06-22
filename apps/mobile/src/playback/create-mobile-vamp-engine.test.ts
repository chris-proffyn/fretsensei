import { isMobileVampEngineSupported } from './create-mobile-vamp-engine';

jest.mock('./create-playback-engine', () => ({
  getMobilePlaybackEngineKind: jest.fn(),
}));

import { getMobilePlaybackEngineKind } from './create-playback-engine';
import { createMobileVampEngineFactory } from './create-mobile-vamp-engine';

describe('createMobileVampEngineFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null in sample playback mode', () => {
    (getMobilePlaybackEngineKind as jest.Mock).mockReturnValue('sample');
    expect(isMobileVampEngineSupported()).toBe(false);
    expect(createMobileVampEngineFactory()).toBeNull();
  });

  it('returns an engine in karplus mode', () => {
    (getMobilePlaybackEngineKind as jest.Mock).mockReturnValue('karplus');
    expect(isMobileVampEngineSupported()).toBe(true);
    expect(createMobileVampEngineFactory()).not.toBeNull();
  });
});
