import type { GuideBlock, GuideSection } from '@fretsensei/utils';
import { renderGuideInlineText } from './renderGuideInlineText';

function GuideBlockView({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="guide-paragraph guide-block">
          {renderGuideInlineText(block.text ?? '')}
        </p>
      );
    case 'bullets':
      return (
        <ul className="guide-list guide-block">
          {(block.items ?? []).map((item) => (
            <li key={item}>{renderGuideInlineText(item)}</li>
          ))}
        </ul>
      );
    case 'steps':
      return (
        <ol className="guide-steps guide-block">
          {(block.items ?? []).map((item) => (
            <li key={item}>{renderGuideInlineText(item)}</li>
          ))}
        </ol>
      );
    case 'callout':
      return (
        <p
          className={`guide-callout guide-block guide-callout--${block.tone ?? 'info'}`}
        >
          {renderGuideInlineText(block.text ?? '')}
        </p>
      );
    default:
      return null;
  }
}

interface GuideArticleProps {
  sections: GuideSection[];
}

export function GuideArticle({ sections }: GuideArticleProps) {
  return (
    <article className="guide-article">
      {sections.map((section) => (
        <section
          key={section.id}
          className="guide-section"
          aria-labelledby={`guide-section-${section.id}`}
        >
          <h2 id={`guide-section-${section.id}`} className="guide-section-title">
            {section.title}
          </h2>
          {section.body.map((block, index) => (
            <GuideBlockView key={`${section.id}-${index}`} block={block} />
          ))}
        </section>
      ))}
    </article>
  );
}
