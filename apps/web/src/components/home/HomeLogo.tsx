export function HomeLogo() {
  return (
    <picture>
      <source srcSet="/logo-lite.svg" media="(prefers-color-scheme: dark)" />
      <img src="/logo.svg" alt="ModeWise" className="home-logo" />
    </picture>
  );
}
