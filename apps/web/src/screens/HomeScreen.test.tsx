import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  Link: ({
    to,
    children,
    className,
    onClick,
  }: {
    to: string;
    children: ReactNode;
    className?: string;
    onClick?: (event: { preventDefault: () => void }) => void;
  }) => (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    >
      {children}
    </a>
  ),
}));

vi.mock('../analytics/track', () => ({
  trackEvent: vi.fn(),
}));

import { trackEvent } from '../analytics/track';
import { HomeScreen } from './HomeScreen';

describe('HomeScreen', () => {
  it('renders headline, body, reassurance, and action links', () => {
    render(<HomeScreen />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Welcome to ModeWise/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/See modes, notes, intervals, and playable guitar patterns/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Free v1: no sign-up, no account, just open and play/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mode Practice/i })).toHaveAttribute(
      'href',
      '/practice',
    );
    expect(screen.getByRole('link', { name: /How to use ModeWise/i })).toHaveAttribute(
      'href',
      '/how-to',
    );
    expect(screen.getByRole('img', { name: /ModeWise/i })).toBeInTheDocument();
  });

  it('uses a primary button style for Mode Practice', () => {
    render(<HomeScreen />);

    expect(screen.getByRole('link', { name: /Mode Practice/i })).toHaveClass(
      'home-action-button--primary',
    );
  });

  it('navigates to practice when Mode Practice is clicked', async () => {
    const user = userEvent.setup();
    render(<HomeScreen />);

    const practiceLink = screen.getByRole('link', { name: /Mode Practice/i });
    await user.click(practiceLink);

    expect(practiceLink).toHaveAttribute('href', '/practice');
  });

  it('navigates to how-to when the secondary link is clicked', async () => {
    const user = userEvent.setup();
    render(<HomeScreen />);

    const howToLink = screen.getByRole('link', { name: /How to use ModeWise/i });
    await user.click(howToLink);

    expect(howToLink).toHaveAttribute('href', '/how-to');
  });

  it('tracks home_viewed on mount', () => {
    render(<HomeScreen />);

    expect(trackEvent).toHaveBeenCalledWith('home_viewed', { platform: 'web' });
  });
});
