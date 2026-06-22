import type { ReactNode } from 'react';

const INLINE_STRONG_PATTERN = /(\*\*[^*]+\*\*)/g;

export function renderGuideInlineText(text: string): ReactNode[] {
  return text.split(INLINE_STRONG_PATTERN).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}
