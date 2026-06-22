import {
  getVisibleHomeActions,
  HOME_ACTIONS,
  HOME_SECONDARY_ACTION,
} from '@fretsensei/utils';
import { Link } from 'react-router-dom';

export function HomeActionList() {
  const visibleActions = getVisibleHomeActions(HOME_ACTIONS);

  return (
    <nav className="home-actions" aria-label="Homepage actions">
      {visibleActions.map((action) => (
        <Link
          key={action.id}
          to={action.route}
          className={`home-action-button home-action-button--${action.variant}`}
        >
          {action.label}
        </Link>
      ))}
      <Link to={HOME_SECONDARY_ACTION.route} className="home-secondary-link">
        {HOME_SECONDARY_ACTION.label}
      </Link>
    </nav>
  );
}
