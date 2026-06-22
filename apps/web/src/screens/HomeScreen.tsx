import { useEffect } from 'react';
import { APP_NAME, HOME_CONTENT } from '@fretsensei/utils';
import { trackEvent } from '../analytics/track';
import { HomeActionList } from '../components/home/HomeActionList';
import { HomeLogo } from '../components/home/HomeLogo';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import '../styles/home.css';

export function HomeScreen() {
  useDocumentTitle(APP_NAME);

  useEffect(() => {
    trackEvent('home_viewed', { platform: 'web' });
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <main className="home-page" id="main-content">
        <div className="home-shell">
          <section className="home-card" aria-labelledby="home-headline">
            <HomeLogo />
            <h1 id="home-headline" className="home-headline">
              {HOME_CONTENT.headline}
            </h1>
            <p className="home-body">{HOME_CONTENT.body}</p>
            <HomeActionList />
            <p className="home-reassurance">{HOME_CONTENT.reassurance}</p>
          </section>
        </div>
      </main>
    </>
  );
}
