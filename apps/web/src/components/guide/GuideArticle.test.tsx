import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { GuideSection } from '@fretsensei/utils';
import { GuideArticle } from './GuideArticle';

const sampleSections: GuideSection[] = [
  {
    id: 'sample',
    title: 'Sample section',
    body: [
      { type: 'paragraph', text: 'Plain paragraph with **bold** text.' },
      { type: 'bullets', items: ['First **item**', 'Second item'] },
      { type: 'steps', items: ['Step one', 'Step two'] },
      { type: 'callout', tone: 'info', text: 'Info callout.' },
    ],
  },
];

describe('GuideArticle', () => {
  it('renders paragraph, list, steps, and callout blocks', () => {
    render(<GuideArticle sections={sampleSections} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Sample section' })).toBeInTheDocument();
    expect(screen.getByText('bold')).toHaveProperty('tagName', 'STRONG');
    expect(screen.getAllByRole('list').length).toBeGreaterThan(0);
    expect(screen.getByText('Info callout.')).toBeInTheDocument();
  });
});
