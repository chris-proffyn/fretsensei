import { PACKAGE_NAME as uiPackage } from '@fretsensei/ui';
import { PACKAGE_NAME as utilsPackage } from '@fretsensei/utils';

export function App() {
  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">FretSensei</p>
        <h1>Guitar fretboard visualiser</h1>
        <p className="subtitle">
          Explore scales, modes, and fretboard patterns across a standard-tuned
          24-fret guitar neck.
        </p>
      </header>
      <p className="status">
        Bootstrap complete — visualiser UI coming in Milestone 2.
      </p>
      <p className="meta">
        Packages: {uiPackage}, {utilsPackage}
      </p>
    </main>
  );
}
