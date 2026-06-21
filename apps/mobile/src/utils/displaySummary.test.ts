import { buildFretboardViewModel, DEFAULT_STATE } from '@fretsensei/utils';
import { getMobileDisplaySummary } from './displaySummary';

describe('getMobileDisplaySummary', () => {
  it('includes key, mode, and pentatonic position', () => {
    const state = { ...DEFAULT_STATE };
    state.selectedNaturalKey = 'A';
    state.selectedModeId = 'minor-pentatonic';
    state.selectedPentatonicPositions = ['2'];
    const viewModel = buildFretboardViewModel(state);

    expect(getMobileDisplaySummary(viewModel, state.selectedPentatonicPositions)).toBe(
      'A Min Pent, Position 2',
    );
  });

  it('omits position for diatonic modes', () => {
    const state = { ...DEFAULT_STATE };
    state.selectedNaturalKey = 'A';
    state.selectedModeId = 'aeolian';
    const viewModel = buildFretboardViewModel(state);

    expect(getMobileDisplaySummary(viewModel, state.selectedPentatonicPositions)).toBe(
      'A Aeolian',
    );
  });
});
