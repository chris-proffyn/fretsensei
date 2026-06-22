import type { GuideSection } from './types';

export const HOW_TO_GUIDE_INTRO = {
  title: 'How to use ModeWise',
  intro: 'A quick guide to the free mode practice app.',
  startPracticeLabel: 'Start Mode Practice',
} as const;

export const HOW_TO_GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'what-modewise-does',
    title: 'What ModeWise does',
    body: [
      {
        type: 'paragraph',
        text: 'ModeWise helps you see how modes and scales sit on a standard-tuned guitar fretboard. Pick a key, choose a mode, and ModeWise shows the notes, roots, intervals, and playable patterns across the neck.',
      },
    ],
  },
  {
    id: 'quick-start',
    title: 'Quick start',
    body: [
      {
        type: 'steps',
        items: [
          'Tap **Mode Practice**.',
          'Choose a **key**.',
          'Choose a **mode**.',
          'Move the fret window to focus on a small area.',
          'Tap **Play** to hear the visible notes.',
        ],
      },
    ],
  },
  {
    id: 'choose-a-key',
    title: 'Choose a key',
    body: [
      {
        type: 'paragraph',
        text: 'Use the key picker to choose the root note for the mode or scale. Turn on the flat option when you want flat keys such as B♭, E♭, or A♭.',
      },
    ],
  },
  {
    id: 'choose-a-mode',
    title: 'Choose a mode or scale',
    body: [
      {
        type: 'paragraph',
        text: 'Use the mode picker to switch between the main diatonic modes and the major/minor pentatonic scales. The fretboard updates immediately when you change mode.',
      },
    ],
  },
  {
    id: 'note-colours',
    title: 'Understand the note colours',
    body: [
      {
        type: 'bullets',
        items: [
          '**Root** shows the main note of the selected key.',
          '**In key** shows notes that belong to the selected mode or scale.',
          '**Blue note** appears when enabled for pentatonic scales.',
          '**Extended** shows optional pattern notes just outside the main fret window.',
          'Hidden notes are outside the selected scale.',
        ],
      },
    ],
  },
  {
    id: 'fret-window',
    title: 'Focus on part of the fretboard',
    body: [
      {
        type: 'paragraph',
        text: 'Use the fret window to focus on a smaller section of the neck. This makes practice more manageable than trying to learn the whole fretboard at once.',
      },
      {
        type: 'paragraph',
        text: 'On web, use **Show all frets** to return to the full neck view. On mobile, use the available full-neck/fret-window control for the same behaviour.',
      },
    ],
  },
  {
    id: 'pentatonic-positions',
    title: 'Use pentatonic positions',
    body: [
      {
        type: 'paragraph',
        text: 'For major and minor pentatonic scales, use the position control to choose common pentatonic shapes. You can select more than one position to practise a wider area.',
      },
    ],
  },
  {
    id: 'display-options',
    title: 'Change what is displayed',
    body: [
      {
        type: 'paragraph',
        text: 'Use the display options to change how the fretboard behaves:',
      },
      {
        type: 'bullets',
        items: [
          '**Blue note** adds the blues note to pentatonic scales.',
          '**3 notes per string** helps practise modal three-note-per-string shapes.',
          '**Extended** adds nearby pattern notes outside the selected window.',
          '**1Oct** narrows the pattern to roughly one octave.',
          '**Degree** shows scale degrees instead of note names.',
          '**Upper** adds upper-position notes for selected pentatonic patterns.',
        ],
      },
    ],
  },
  {
    id: 'playback',
    title: 'Play the notes back',
    body: [
      {
        type: 'paragraph',
        text: 'Use **Play** to hear the visible notes in the focused fret window. Use **Stop** to end playback. Change the BPM or subdivision to make the pattern slower, faster, or more detailed. Turn on repeat to keep the pattern looping.',
      },
      {
        type: 'paragraph',
        text: 'Full-neck playback is not available in v1 because the full neck contains too many notes to be useful as a simple practice sequence. Focus on a smaller fret range first, then press Play.',
      },
    ],
  },
  {
    id: 'first-practice-routine',
    title: 'Suggested first practice routine',
    body: [
      {
        type: 'steps',
        items: [
          'Choose **C Ionian**.',
          'Focus on a small fret range.',
          'Play the notes slowly.',
          'Switch on **Degree** and say the scale degrees as you play.',
          'Change to **Dorian** and listen to how the sound changes.',
          'Try the same idea with **minor pentatonic**.',
        ],
      },
    ],
  },
  {
    id: 'v1-limits',
    title: 'Current v1 limits',
    tier: 'free',
    body: [
      {
        type: 'callout',
        tone: 'info',
        text: 'The first version is intentionally lightweight. It does not include accounts, saved progress, backing tracks, gamification, microphone listening, or assessment.',
      },
    ],
  },
  {
    id: 'future-updates',
    title: 'Future updates',
    tier: 'free',
    body: [
      {
        type: 'callout',
        tone: 'info',
        text: 'Future versions may add structured practice, saved progress, fretboard drills, vamps, chord progressions, and assessment tools.',
      },
    ],
  },
];
