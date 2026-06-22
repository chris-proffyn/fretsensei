import { HOME_CONTENT } from '@fretsensei/utils';
import TestRenderer, { act } from 'react-test-renderer';
import { HomeScreen } from './HomeScreen';

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

describe('HomeScreen', () => {
  it('renders homepage copy and actions', () => {
    let renderer!: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(<HomeScreen />);
    });

    const output = JSON.stringify(renderer.toJSON());

    expect(output).toContain(HOME_CONTENT.headline);
    expect(output).toContain(HOME_CONTENT.body);
    expect(output).toContain(HOME_CONTENT.primaryActionLabel);
    expect(output).toContain(HOME_CONTENT.secondaryActionLabel);
    expect(output).toContain(HOME_CONTENT.reassurance);
  });
});
