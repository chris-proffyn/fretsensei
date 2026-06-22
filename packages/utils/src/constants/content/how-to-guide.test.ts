import { HOW_TO_GUIDE_INTRO, HOW_TO_GUIDE_SECTIONS } from './how-to-guide';

const REQUIRED_SECTION_IDS = [
  'what-modewise-does',
  'quick-start',
  'choose-a-key',
  'choose-a-mode',
  'note-colours',
  'fret-window',
  'pentatonic-positions',
  'display-options',
  'playback',
  'first-practice-routine',
  'v1-limits',
  'future-updates',
] as const;

describe('how-to guide content', () => {
  it('exposes guide intro metadata', () => {
    expect(HOW_TO_GUIDE_INTRO.title).toBe('How to use ModeWise');
    expect(HOW_TO_GUIDE_INTRO.intro.length).toBeGreaterThan(0);
    expect(HOW_TO_GUIDE_INTRO.startPracticeLabel).toBe('Start Mode Practice');
  });

  it('includes all required v1 section ids exactly once', () => {
    const ids = HOW_TO_GUIDE_SECTIONS.map((section) => section.id);
    expect(ids).toHaveLength(REQUIRED_SECTION_IDS.length);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([...REQUIRED_SECTION_IDS]);
  });

  it('covers key visualiser topics in section titles', () => {
    const titles = HOW_TO_GUIDE_SECTIONS.map((section) => section.title.toLowerCase());

    expect(titles.some((title) => title.includes('key'))).toBe(true);
    expect(titles.some((title) => title.includes('mode'))).toBe(true);
    expect(titles.some((title) => title.includes('colour'))).toBe(true);
    expect(titles.some((title) => title.includes('fretboard'))).toBe(true);
    expect(titles.some((title) => title.includes('pentatonic'))).toBe(true);
    expect(titles.some((title) => title.includes('display'))).toBe(true);
    expect(titles.some((title) => title.includes('play'))).toBe(true);
    expect(titles.some((title) => title.includes('limit'))).toBe(true);
  });

  it('uses structured blocks rather than empty sections', () => {
    for (const section of HOW_TO_GUIDE_SECTIONS) {
      expect(section.body.length).toBeGreaterThan(0);
    }
  });

  it('does not claim unavailable v1 features in the limits section', () => {
    const limits = HOW_TO_GUIDE_SECTIONS.find((section) => section.id === 'v1-limits');
    const limitsText = JSON.stringify(limits?.body ?? '').toLowerCase();

    expect(limitsText).toContain('does not include');
    expect(limitsText).toContain('accounts');
    expect(limitsText).not.toMatch(/\bincludes accounts\b/);
    expect(limitsText).not.toMatch(/\bavailable now\b/);
  });

  it('frames future updates as possible later capabilities', () => {
    const future = HOW_TO_GUIDE_SECTIONS.find((section) => section.id === 'future-updates');
    const futureText = JSON.stringify(future?.body ?? '').toLowerCase();

    expect(futureText).toContain('future versions may add');
    expect(futureText).not.toMatch(/\bavailable in v1\b/);
    expect(futureText).not.toMatch(/\bincluded today\b/);
  });
});
