import { HOW_TO_GUIDE_INTRO } from '@fretsensei/utils';
import { Link } from 'react-router-dom';

interface GuideStartPracticeCtaProps {
  className?: string;
}

export function GuideStartPracticeCta({ className = 'guide-cta-row' }: GuideStartPracticeCtaProps) {
  return (
    <div className={className}>
      <Link className="guide-start-button" to="/practice">
        {HOW_TO_GUIDE_INTRO.startPracticeLabel}
      </Link>
    </div>
  );
}
