import { APP_TITLE } from '@fretsensei/utils';

export function HeroHeader() {
  return (
    <header className="hero">
      <div className="hero-title-row">
        <picture>
          <source srcSet="/logo-lite.svg" media="(prefers-color-scheme: dark)" />
          <img src="/logo.svg" alt="ModeWise" className="hero-logo" />
        </picture>
        <h1 className="hero-title">
          <span className="hero-brand">
            <span className="hero-brand-mode">Mode</span>
            <span className="hero-brand-wise">Wise</span>
          </span>
          <span className="hero-title-separator"> - </span>
          <span className="hero-tagline">{APP_TITLE}</span>
        </h1>
      </div>
    </header>
  );
}
