import { Link } from 'react-router-dom';

export function AppBackLink() {
  return (
    <Link className="guide-back-link" to="/">
      ← Home
    </Link>
  );
}
