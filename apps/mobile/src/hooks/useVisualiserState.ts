import {
  buildFretboardViewModel,
  DEFAULT_STATE,
  initializeVisualiserState,
  visualiserReducer,
  type VisualiserAction,
  type VisualiserState,
} from '@fretsensei/utils';
import { useMemo, useReducer } from 'react';

export function useVisualiserState(initialState: VisualiserState = DEFAULT_STATE) {
  const [state, dispatch] = useReducer(
    visualiserReducer,
    initialState,
    initializeVisualiserState,
  );
  const viewModel = useMemo(() => buildFretboardViewModel(state), [state]);

  return { state, viewModel, dispatch };
}

export type { VisualiserAction, VisualiserState };
