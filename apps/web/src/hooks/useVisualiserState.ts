import {
  buildFretboardViewModel,
  DEFAULT_STATE,
  initializeVisualiserState,
  visualiserReducer,
  type VisualiserAction,
  type VisualiserState,
} from '@fretsensei/utils';
import { useMemo, useReducer } from 'react';

/**
 * Recomputes the full fretboard view model when visualiser state changes.
 * At 150 cells this is acceptable for v1 (see FR-033); memoisation avoids
 * redundant work when unrelated parent re-renders occur.
 */
export function useVisualiserState(initialState: VisualiserState = DEFAULT_STATE) {
  const [state, dispatch] = useReducer(
    visualiserReducer,
    initialState,
    initializeVisualiserState,
  );

  const viewModel = useMemo(() => buildFretboardViewModel(state), [state]);

  return {
    state,
    viewModel,
    dispatch,
    dispatchAction(action: VisualiserAction) {
      dispatch(action);
    },
  };
}

export type UseVisualiserStateReturn = ReturnType<typeof useVisualiserState>;
