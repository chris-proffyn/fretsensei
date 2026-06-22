import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

import { HomeScreen } from './screens/HomeScreen';

describe('HomeScreen', () => {
  it('links to practice and how-to routes', () => {
    render(<HomeScreen />);

    expect(screen.getByRole('link', { name: /Mode Practice/i })).toHaveAttribute(
      'href',
      '/practice',
    );
    expect(screen.getByRole('link', { name: /How to use ModeWise/i })).toHaveAttribute(
      'href',
      '/how-to',
    );
  });
});
