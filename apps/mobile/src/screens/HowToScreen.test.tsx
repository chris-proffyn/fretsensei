import { HOW_TO_GUIDE_INTRO } from '@fretsensei/utils';
import TestRenderer, { act } from 'react-test-renderer';
import { Pressable } from 'react-native';
import { HowToScreen } from './HowToScreen';

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    SafeAreaView: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
    }) => React.createElement(View, props, children),
  };
});

const REQUIRED_SECTION_TITLES = [
  'What ModeWise does',
  'Quick start',
  'Choose a key',
  'Choose a mode or scale',
  'Understand the note colours',
  'Focus on part of the fretboard',
  'Use pentatonic positions',
  'Change what is displayed',
  'Play the notes back',
  'Use the one-chord vamp',
  'Suggested first practice routine',
  'Current v1 limits',
  'Future updates',
];

describe('HowToScreen', () => {
  it('renders intro, back link, section headings, and start practice CTAs', () => {
    let renderer!: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(<HowToScreen />);
    });

    const output = JSON.stringify(renderer.toJSON());

    expect(output).toContain(HOW_TO_GUIDE_INTRO.title);
    expect(output).toContain(HOW_TO_GUIDE_INTRO.intro);
    expect(output).toContain('← Home');

    for (const title of REQUIRED_SECTION_TITLES) {
      expect(output).toContain(title);
    }

    const startButtons = renderer.root
      .findAllByType(Pressable)
      .filter(
        (node) =>
          node.props.accessibilityLabel === HOW_TO_GUIDE_INTRO.startPracticeLabel,
      );
    expect(startButtons).toHaveLength(2);
  });
});
