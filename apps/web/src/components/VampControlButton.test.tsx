import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VampControlButton } from './VampControlButton';

describe('VampControlButton', () => {
  it('renders start label when idle', () => {
    render(
      <VampControlButton
        isPlaying={false}
        dyadLabel="C + G drone"
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Start C \+ G drone/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByText('Vamp')).toBeInTheDocument();
  });

  it('renders stop label when active', () => {
    render(
      <VampControlButton
        isPlaying
        dyadLabel="C + G drone"
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Stop C \+ G drone/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('Stop')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn();

    render(
      <VampControlButton
        isPlaying={false}
        dyadLabel="C + G drone"
        onToggle={onToggle}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Start C \+ G drone/i }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
