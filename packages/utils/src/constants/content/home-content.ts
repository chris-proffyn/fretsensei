import type { HomeAction, HomeSecondaryAction } from './types';

export const HOME_CONTENT = {
  headline: 'Welcome to ModeWise',
  body: 'See modes, notes, intervals, and playable guitar patterns across the fretboard. Choose a key, pick a mode, focus on a fret range, and hear the notes back.',
  primaryActionLabel: 'Mode Practice',
  secondaryActionLabel: 'How to use ModeWise',
  reassurance: 'Free v1: no sign-up, no account, just open and play.',
} as const;

export const HOME_ACTIONS: HomeAction[] = [
  {
    id: 'mode-practice',
    label: 'Mode Practice',
    description: 'Open the fretboard visualiser.',
    route: '/practice',
    variant: 'primary',
    enabled: true,
    visible: true,
  },
];

export const HOME_SECONDARY_ACTION: HomeSecondaryAction = {
  id: 'how-to',
  label: 'How to use ModeWise',
  route: '/how-to',
  variant: 'secondary',
};
