import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
  useSearchParams: () => [new URLSearchParams()],
}));

vi.mock('../analytics/track', () => ({
  trackEvent: vi.fn(),
}));

import { trackEvent } from '../analytics/track';
import { HowToScreen } from './HowToScreen';

const REQUIRED_SECTION_TITLES = [
  'What ModeWise does',
  'Quick start',
  'Choose a key',
  'Choose a mode or scale',
  'Understand the note colours',
  'Focus on part of the fretboard',
  'Use pentatonic positions',
  'Change what is displayed',
  'Play the notes back',
  'Suggested first practice routine',
  'Current v1 limits',
  'Future updates',
];

describe('HowToScreen', () => {
  it('renders intro, back link, and all guide section headings', () => {
    render(<HowToScreen />);

    expect(
      screen.getByRole('heading', { level: 1, name: /How to use ModeWise/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/A quick guide to the free mode practice app/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Home/i })).toHaveAttribute('href', '/');

    for (const title of REQUIRED_SECTION_TITLES) {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
    }
  });

  it('renders start practice CTAs linking to practice', () => {
    render(<HowToScreen />);

    const startLinks = screen.getAllByRole('link', { name: /Start Mode Practice/i });
    expect(startLinks).toHaveLength(2);
    for (const link of startLinks) {
      expect(link).toHaveAttribute('href', '/practice');
    }
  });

  it('tracks how_to_viewed on mount', () => {
    render(<HowToScreen />);

    expect(trackEvent).toHaveBeenCalledWith('how_to_viewed', {
      platform: 'web',
      source: 'direct',
    });
  });
});
