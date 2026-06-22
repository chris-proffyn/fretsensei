import TestRenderer, { act } from 'react-test-renderer';
import { Pressable } from 'react-native';
import { VampControlButton } from './VampControlButton';

describe('VampControlButton', () => {
  it('renders vamp labels and calls onToggle', () => {
    const onToggle = jest.fn();
    let renderer!: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(
        <VampControlButton
          isPlaying={false}
          dyadLabel="C + G drone"
          onToggle={onToggle}
        />,
      );
    });

    const output = JSON.stringify(renderer.toJSON());
    expect(output).toContain('Vamp');

    const button = renderer.root.findByType(Pressable);
    act(() => {
      button.props.onPress();
    });

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
