import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  Link: ({
    to,
    children,
    'aria-label': ariaLabel,
  }: {
    to: string;
    children: ReactNode;
    'aria-label'?: string;
  }) => (
    <a href={to} aria-label={ariaLabel}>
      {children}
    </a>
  ),
}));

import { PracticeNavLinks } from './PracticeNavLinks';

describe('PracticeNavLinks', () => {
  it('renders home and help links', () => {
    render(<PracticeNavLinks />);

    expect(screen.getByRole('navigation', { name: /Practice navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to homepage/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /How to use ModeWise/i })).toHaveAttribute(
      'href',
      '/how-to?source=practice',
    );
  });
});
