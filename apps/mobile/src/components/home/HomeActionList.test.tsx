import {
  HOME_CONTENT,
  HOME_SECONDARY_ACTION,
  getVisibleHomeActions,
  HOME_ACTIONS,
} from '@fretsensei/utils';
import TestRenderer, { act } from 'react-test-renderer';
import { HomeActionList } from './HomeActionList';

describe('HomeActionList', () => {
  it('renders primary and secondary homepage actions', () => {
    let renderer!: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(<HomeActionList />);
    });

    const output = JSON.stringify(renderer.toJSON());
    const visibleActions = getVisibleHomeActions(HOME_ACTIONS);

    for (const action of visibleActions) {
      expect(output).toContain(action.label);
    }

    expect(output).toContain(HOME_SECONDARY_ACTION.label);
    expect(output).not.toContain(HOME_CONTENT.headline);
  });
});
