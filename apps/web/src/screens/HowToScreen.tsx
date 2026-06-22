import { useEffect } from 'react';
import {
  filterGuideSections,
  HOW_TO_GUIDE_INTRO,
  HOW_TO_GUIDE_SECTIONS,
} from '@fretsensei/utils';
import { useSearchParams } from 'react-router-dom';
import { trackEvent } from '../analytics/track';
import { GuideArticle } from '../components/guide/GuideArticle';
import { GuideStartPracticeCta } from '../components/guide/GuideStartPracticeCta';
import { AppBackLink } from '../components/navigation/AppBackLink';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import '../styles/guide.css';

export function HowToScreen() {
  useDocumentTitle(HOW_TO_GUIDE_INTRO.title);
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source') ?? 'direct';

  const sections = filterGuideSections(HOW_TO_GUIDE_SECTIONS, {
    platform: 'web',
    tier: 'free',
  });

  useEffect(() => {
    trackEvent('how_to_viewed', { platform: 'web', source });
  }, [source]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <main className="guide-page" id="main-content">
        <div className="guide-shell">
          <AppBackLink />
          <header className="guide-header">
            <h1 className="guide-title">{HOW_TO_GUIDE_INTRO.title}</h1>
            <p className="guide-intro">{HOW_TO_GUIDE_INTRO.intro}</p>
          </header>
          <GuideStartPracticeCta />
          <GuideArticle sections={sections} />
          <GuideStartPracticeCta className="guide-cta-row guide-cta-row--bottom" />
        </div>
      </main>
    </>
  );
}
