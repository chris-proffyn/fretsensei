import { DEFAULT_STATE } from '@fretsensei/utils';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useVisualiserState } from '../hooks/useVisualiserState';
import { getLiveEditingTarget, SettingsPanel } from './SettingsPanel';

function TestSettingsPanel() {
  const { state, viewModel, dispatch } = useVisualiserState();

  return (
    <>
      <SettingsPanel
        open
        onClose={vi.fn()}
        state={state}
        dispatch={dispatch}
      />
      <p data-testid="fretboard-range">
        {viewModel.fretRange.isFullNeck
          ? 'Full neck'
          : `Frets ${viewModel.fretRange.start}–${viewModel.fretRange.end}`}
      </p>
    </>
  );
}

describe('SettingsPanel', () => {
  it('opens on the live diatonic row and scrolls it into view', async () => {
    const scrollIntoView = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(<TestSettingsPanel />);

    expect(screen.getByTestId('settings-editing-label')).toHaveTextContent(
      'Active: Ionian · C · 7–10',
    );
    expect(screen.getByTestId('fretboard-range')).toHaveTextContent(
      'Frets 7–10',
    );

    const editingRow = screen.getByTestId('settings-editing-row');
    expect(
      within(editingRow).getByRole('spinbutton', {
        name: 'Ionian C starting fret',
      }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalled();
    });
  });

  it('applies the pentatonic row to the fretboard when it becomes active', async () => {
    const user = userEvent.setup();
    render(<TestSettingsPanel />);

    const startInput = screen.getByRole('spinbutton', {
      name: 'Minor Pentatonic A position 3 starting fret',
    });
    await user.click(startInput);

    expect(screen.getByTestId('settings-editing-label')).toHaveTextContent(
      'Active: Minor Pentatonic · A · Pos 3 · 9–13',
    );
    expect(screen.getByTestId('fretboard-range')).toHaveTextContent(
      'Frets 9–13',
    );
  });

  it('applies the diatonic row to the fretboard when it becomes active', async () => {
    const user = userEvent.setup();
    render(<TestSettingsPanel />);

    await user.click(
      screen.getByRole('spinbutton', { name: 'Dorian D starting fret' }),
    );

    expect(screen.getByTestId('settings-editing-label')).toHaveTextContent(
      'Active: Dorian · D · 9–13',
    );
    expect(screen.getByTestId('fretboard-range')).toHaveTextContent(
      'Frets 9–13',
    );
  });

  it('closes when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <SettingsPanel
        open
        onClose={onClose}
        state={DEFAULT_STATE}
        dispatch={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('open');

    await user.click(screen.getByRole('button', { name: 'Close settings' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.settings-dialog')).not.toHaveAttribute('open');
  });

  it('resolves the live pentatonic entry from the configured default position', () => {
    const pentatonicState = {
      ...DEFAULT_STATE,
      selectedModeId: 'minor-pentatonic',
      selectedNaturalKey: 'A' as const,
      selectedPentatonicPositions: ['1', '2'] as const,
    };

    expect(getLiveEditingTarget(pentatonicState)).toEqual({
      kind: 'pentatonic',
      modeId: 'minor-pentatonic',
      key: 'A',
      position: '3',
    });
  });
});
