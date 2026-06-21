import {
  buildFretboardViewModel,
  buildPlaybackSessionContext,
  DEFAULT_STATE,
  getPlaybackFretWindow,
  isPlaybackAvailable,
} from '@fretsensei/utils';

describe('mobile visualiser smoke', () => {
  it('builds a full-neck view model', () => {
    const viewModel = buildFretboardViewModel(DEFAULT_STATE);

    expect(viewModel.cells).toHaveLength(150);
    expect(viewModel.fretRange.isFullNeck).toBe(true);
    expect(viewModel.selectedKey.displayLabel).toBe('C');
  });

  it('enables playback in a focused fret window', () => {
    const viewModel = buildFretboardViewModel({
      ...DEFAULT_STATE,
      selectedFretStart: 5,
      selectedFretWidth: 4,
    });

    const fretWindow = getPlaybackFretWindow(
      viewModel.fretRange.start,
      viewModel.fretRange.end,
      viewModel.fretRange.isFullNeck,
    );

    expect(
      isPlaybackAvailable(
        viewModel.cells,
        viewModel.fretRange.isFullNeck,
        fretWindow,
      ),
    ).toBe(true);

    const session = buildPlaybackSessionContext(
      viewModel.cells,
      viewModel.fretRange.isFullNeck,
      {
        bpm: 90,
        subdivision: 1,
        playbackDirection: 'up',
        repeatPlayback: false,
        extendedPattern: false,
      },
      fretWindow,
    );

    expect(session.available).toBe(true);
    expect(session.sequence.length).toBeGreaterThan(0);
  });
});
