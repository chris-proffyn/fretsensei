import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { VisualiserScreen } from '../components/VisualiserScreen';
import { usePlaybackController } from '../hooks/usePlaybackController';
import { useVisualiserState } from '../hooks/useVisualiserState';

function TestVisualiser() {
  const { state, viewModel, dispatch } = useVisualiserState();
  const playback = usePlaybackController({
    state,
    viewModel,
    dispatch,
    engine: {
      initialise: vi.fn().mockResolvedValue(undefined),
      playSequence: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn(),
      dispose: vi.fn(),
    },
  });

  return (
    <VisualiserScreen
      state={state}
      viewModel={viewModel}
      dispatch={dispatch}
      playback={playback}
    />
  );
}

describe('VisualiserScreen', () => {
  it('renders default C Ionian focused fret window', () => {
    render(<TestVisualiser />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Guitar Mode Mastery',
    );
    expect(
      screen.getByText(/Select a key and mode to see every note/i),
    ).not.toBeVisible();
    expect(
      screen.getByLabelText('Selected fret range 7-10'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Choose key')).toBeInTheDocument();
  });

  it('shows the app description when the info button is clicked', async () => {
    const user = userEvent.setup();
    render(<TestVisualiser />);

    await user.click(screen.getByRole('button', { name: 'About this app' }));

    expect(
      screen.getByText(/Select a key and mode to see every note/i),
    ).toBeInTheDocument();
  });

  it('updates active key button when a new key is selected', async () => {
    const user = userEvent.setup();
    render(<TestVisualiser />);

    const keyGroup = screen.getByLabelText('Choose key');
    const dButton = within(keyGroup).getByRole('button', { name: 'D' });
    await user.click(dButton);

    expect(dButton).toHaveAttribute('aria-pressed', 'true');
    expect(within(keyGroup).getByRole('button', { name: 'C' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('updates active mode button when a new mode is selected', async () => {
    const user = userEvent.setup();
    render(<TestVisualiser />);

    const modeGroup = screen.getByLabelText('Choose mode');
    const dorianButton = within(modeGroup).getByRole('button', {
      name: 'Dorian',
    });
    await user.click(dorianButton);

    expect(dorianButton).toHaveAttribute('aria-pressed', 'true');

    const scaleMap = screen.getByLabelText('Scale interval and note map');
    expect(within(scaleMap).getByText('b3')).toBeInTheDocument();
  });

  it('hides pentatonic position control for non-pentatonic modes', () => {
    render(<TestVisualiser />);

    expect(
      screen.queryByRole('group', { name: /pentatonic position/i }),
    ).not.toBeInTheDocument();
  });

  it('shows pentatonic position control for pentatonic modes', async () => {
    const user = userEvent.setup();
    render(<TestVisualiser />);

    const modeGroup = screen.getByLabelText('Choose mode');
    await user.click(
      within(modeGroup).getByRole('button', { name: 'Minor Pentatonic' }),
    );

    const positionGroup = screen.getByRole('group', { name: 'Pentatonic position' });
    expect(positionGroup).toBeInTheDocument();
    expect(within(positionGroup).getByRole('button', { name: 'Position 1' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'All positions' })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /blue note/i })).not.toBeDisabled();
  });

  it('disables blue note for non-pentatonic modes', async () => {
    const user = userEvent.setup();
    render(<TestVisualiser />);

    const modeGroup = screen.getByLabelText('Choose mode');
    await user.click(
      within(modeGroup).getByRole('button', { name: 'Minor Pentatonic' }),
    );
    await user.click(screen.getByRole('checkbox', { name: /blue note/i }));
    await user.click(within(modeGroup).getByRole('button', { name: 'Ionian' }));

    expect(screen.getByRole('checkbox', { name: /blue note/i })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: /blue note/i })).not.toBeChecked();
  });

  it('renders scale map with degree above note name', () => {
    render(<TestVisualiser />);

    const scaleMap = screen.getByLabelText('Scale interval and note map');
    expect(within(scaleMap).getByText('1')).toBeInTheDocument();
    expect(within(scaleMap).getByText('C')).toBeInTheDocument();
    expect(within(scaleMap).getByText('7')).toBeInTheDocument();
    expect(within(scaleMap).getByText('B')).toBeInTheDocument();
  });

  it('sets full neck when All button is clicked after focusing', async () => {
    const user = userEvent.setup();
    render(<TestVisualiser />);

    await user.click(screen.getByLabelText('Set fret window start to 5'));
    expect(
      screen.getByLabelText('Selected fret range 5-8'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show all frets' }));
    expect(
      screen.getByLabelText('Selected fret range 0-24'),
    ).toBeInTheDocument();
  });

  it('renders fretboard with scale notes', () => {
    render(<TestVisualiser />);

    expect(screen.getByTestId('fretboard-grid')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('fretboard-grid')).getAllByLabelText(
        /string, fret/i,
      ).length,
    ).toBeGreaterThan(0);
  });

  it('keeps play enabled in full-neck mode and shows guidance on click', async () => {
    const user = userEvent.setup();
    render(<TestVisualiser />);

    await user.click(screen.getByRole('button', { name: 'Show all frets' }));

    expect(screen.getByTestId('play-button')).not.toBeDisabled();
    expect(screen.queryByTestId('status-banner')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('play-button'));

    expect(screen.getByTestId('full-neck-playback-tooltip')).toHaveTextContent(
      /full-neck/i,
    );
  });

  it('enables play in a focused window after full-neck mode', async () => {
    const user = userEvent.setup();
    render(<TestVisualiser />);

    expect(screen.getByTestId('play-button')).not.toBeDisabled();

    await user.click(screen.getByLabelText('Set fret window start to 5'));

    expect(screen.getByTestId('play-button')).not.toBeDisabled();
    expect(screen.queryByTestId('full-neck-playback-tooltip')).not.toBeInTheDocument();
  });

  it('renders playback transport and tempo controls', () => {
    render(<TestVisualiser />);

    expect(screen.getByTestId('playback-panel-summary')).toHaveTextContent('C Ionian');
    expect(screen.getByTestId('play-button')).toBeInTheDocument();
    expect(screen.getByTestId('stop-button')).toBeInTheDocument();
    expect(screen.getByLabelText('BPM')).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Subdivision' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Quarter notes' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /repeat/i })).toBeInTheDocument();
  });

  it('toggles maximized fretboard overlay', async () => {
    const user = userEvent.setup();
    render(<TestVisualiser />);

    expect(screen.queryByTestId('fretboard-maximized-overlay')).not.toBeInTheDocument();
    expect(screen.getByTestId('fretboard-wrap')).toBeInTheDocument();

    await user.click(screen.getByTestId('playback-panel-toggle'));

    expect(screen.getByTestId('fretboard-maximized-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('playback-panel-summary')).toHaveTextContent('C Ionian');
    expect(screen.getByTestId('play-button')).toBeInTheDocument();
    expect(screen.getAllByTestId('fretboard-wrap')).toHaveLength(1);

    await user.click(screen.getByTestId('playback-panel-toggle'));

    expect(screen.queryByTestId('fretboard-maximized-overlay')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('fretboard-wrap')).toHaveLength(1);
  });

  it('closes maximized fretboard overlay with Escape', async () => {
    const user = userEvent.setup();
    render(<TestVisualiser />);

    await user.click(screen.getByTestId('playback-panel-toggle'));
    expect(screen.getByTestId('fretboard-maximized-overlay')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByTestId('fretboard-maximized-overlay')).not.toBeInTheDocument();
  });

  it('updates playback summary when key and mode change', async () => {
    const user = userEvent.setup();
    render(<TestVisualiser />);

    await user.click(screen.getByRole('button', { name: 'D' }));
    await user.click(screen.getByRole('button', { name: 'Dorian' }));

    expect(screen.getByTestId('playback-panel-summary')).toHaveTextContent('D Dorian');
  });

  it('shows BPM validation guidance when out of range', async () => {
    const user = userEvent.setup();
    render(<TestVisualiser />);

    await user.click(screen.getByLabelText('Set fret window start to 5'));
    const bpmInput = screen.getByLabelText('BPM');
    await user.clear(bpmInput);
    await user.type(bpmInput, '300');
    await user.tab();

    expect(screen.getByTestId('status-banner')).toHaveTextContent(/40 and 220/);
  });
});
