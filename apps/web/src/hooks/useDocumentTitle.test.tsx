import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDocumentTitle } from './useDocumentTitle';

function TitleProbe({ title }: { title: string }) {
  useDocumentTitle(title);
  return <div>probe</div>;
}

describe('useDocumentTitle', () => {
  it('sets document.title when mounted', () => {
    render(<TitleProbe title="Mode Practice — ModeWise" />);
    expect(document.title).toBe('Mode Practice — ModeWise');
  });
});
