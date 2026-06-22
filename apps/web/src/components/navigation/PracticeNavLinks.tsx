import { HOME_SECONDARY_ACTION } from '@fretsensei/utils';
import { Link } from 'react-router-dom';

function HelpIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export function PracticeNavLinks() {
  return (
    <nav className="practice-nav-links" aria-label="Practice navigation">
      <Link className="practice-nav-link" to="/" aria-label="Return to homepage">
        Home
      </Link>
      <Link
        className="practice-nav-link practice-nav-link--icon"
        to={`${HOME_SECONDARY_ACTION.route}?source=practice`}
        aria-label={HOME_SECONDARY_ACTION.label}
        title={HOME_SECONDARY_ACTION.label}
      >
        <HelpIcon />
      </Link>
    </nav>
  );
}
