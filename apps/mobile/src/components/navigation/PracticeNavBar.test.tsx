import TestRenderer, { act } from 'react-test-renderer';
import { Pressable } from 'react-native';
import { PracticeNavBar } from './PracticeNavBar';

describe('PracticeNavBar', () => {
  it('renders home control', () => {
    let renderer!: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(<PracticeNavBar onPressHome={jest.fn()} />);
    });

    const output = JSON.stringify(renderer.toJSON());
    expect(output).toContain('Home');
    expect(output).not.toContain('?');
  });

  it('calls onPressHome when home is pressed', () => {
    const onPressHome = jest.fn();
    let renderer!: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(<PracticeNavBar onPressHome={onPressHome} />);
    });

    const homeButton = renderer.root.findByType(Pressable);

    act(() => {
      homeButton.props.onPress();
    });

    expect(onPressHome).toHaveBeenCalledTimes(1);
  });
});
