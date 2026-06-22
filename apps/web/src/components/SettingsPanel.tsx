import {
  buildDiatonicDefaultView,
  getModeById,
  getPentatonicPositionsForMode,
  isPentatonicMode,
  MODES,
  NATURAL_KEYS,
  type ModeKeyDefaultView,
  type NaturalKey,
  type PentatonicPositionDefaultView,
  type PentatonicShapePosition,
  type VisualiserAction,
  type VisualiserState,
} from '@fretsensei/utils';
import type { Dispatch } from 'react';
import { useEffect, useRef, useState } from 'react';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  state: VisualiserState;
  dispatch: Dispatch<VisualiserAction>;
}

const DIATONIC_MODES = MODES.filter((mode) => !isPentatonicMode(mode));
const PENTATONIC_MODES = MODES.filter((mode) => isPentatonicMode(mode));

type EditingTarget =
  | { kind: 'diatonic'; modeId: string; key: NaturalKey }
  | {
      kind: 'pentatonic';
      modeId: string;
      key: NaturalKey;
      position: PentatonicShapePosition;
    };

function getKeyDefaultView(
  state: VisualiserState,
  modeId: string,
  key: NaturalKey,
): ModeKeyDefaultView {
  return (
    state.layoutConfig.modeKeyDefaultViews[modeId]?.[key] ??
    buildDiatonicDefaultView(key, modeId)
  );
}

function getPositionDefaultView(
  state: VisualiserState,
  modeId: string,
  key: NaturalKey,
  position: PentatonicShapePosition,
): PentatonicPositionDefaultView {
  return (
    state.layoutConfig.pentatonicKeyDefaults[modeId]?.[key]?.positions[position] ?? {
      selectedFretStart: 0,
      selectedFretWidth: 25,
    }
  );
}

function formatRange(start: number, width: number): string {
  if (width >= 25 && start === 0) {
    return 'Full neck';
  }

  return `${start}–${start + width - 1}`;
}

function getLivePentatonicPosition(
  state: VisualiserState,
  modeId: string,
  key: NaturalKey,
): PentatonicShapePosition {
  if (state.selectedPentatonicPositions.length === 1) {
    return state.selectedPentatonicPositions[0];
  }

  const configuredDefault =
    state.layoutConfig.pentatonicKeyDefaults[modeId]?.[key]?.defaultPosition;
  if (configuredDefault) {
    return configuredDefault;
  }

  const firstSelected = getPentatonicPositionsForMode(modeId).find((position) =>
    state.selectedPentatonicPositions.includes(position),
  );
  return firstSelected ?? getPentatonicPositionsForMode(modeId)[0] ?? '1';
}

export function getLiveEditingTarget(state: VisualiserState): EditingTarget {
  const mode = getModeById(state.selectedModeId);

  if (isPentatonicMode(mode)) {
    return {
      kind: 'pentatonic',
      modeId: state.selectedModeId,
      key: state.selectedNaturalKey,
      position: getLivePentatonicPosition(
        state,
        state.selectedModeId,
        state.selectedNaturalKey,
      ),
    };
  }

  return {
    kind: 'diatonic',
    modeId: state.selectedModeId,
    key: state.selectedNaturalKey,
  };
}

function isEditingTarget(
  target: EditingTarget,
  modeId: string,
  key: NaturalKey,
  position?: PentatonicShapePosition,
): boolean {
  if (target.kind === 'pentatonic') {
    return (
      target.modeId === modeId &&
      target.key === key &&
      target.position === position
    );
  }

  return target.modeId === modeId && target.key === key && position === undefined;
}

function formatEditingLabel(target: EditingTarget): string {
  const mode = getModeById(target.modeId).shortName;

  if (target.kind === 'pentatonic') {
    return `${mode} · ${target.key} · Pos ${target.position}`;
  }

  return `${mode} · ${target.key}`;
}

function getActiveRowRange(state: VisualiserState, target: EditingTarget): string {
  if (target.kind === 'pentatonic') {
    const view = getPositionDefaultView(
      state,
      target.modeId,
      target.key,
      target.position,
    );
    return formatRange(view.selectedFretStart, view.selectedFretWidth);
  }

  const view = getKeyDefaultView(state, target.modeId, target.key);
  return formatRange(view.selectedFretStart, view.selectedFretWidth);
}

export function applyEditingTarget(
  dispatch: Dispatch<VisualiserAction>,
  target: EditingTarget,
): void {
  if (target.kind === 'pentatonic') {
    dispatch({
      type: 'applyPentatonicPositionDefaultView',
      modeId: target.modeId,
      key: target.key,
      position: target.position,
    });
    return;
  }

  dispatch({
    type: 'applyModeKeyDefaultView',
    modeId: target.modeId,
    key: target.key,
  });
}

export function SettingsPanel({
  open,
  onClose,
  state,
  dispatch,
}: SettingsPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const editingRowRef = useRef<HTMLTableRowElement>(null);
  const [editingTarget, setEditingTarget] = useState<EditingTarget>(() =>
    getLiveEditingTarget(state),
  );

  const syncEditingTarget = (target: EditingTarget) => {
    setEditingTarget(target);
    applyEditingTarget(dispatch, target);
  };

  const handleClose = () => {
    dialogRef.current?.close();
    onClose();
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    syncEditingTarget(getLiveEditingTarget(state));

    const frame = requestAnimationFrame(() => {
      editingRowRef.current?.scrollIntoView({
        block: 'center',
        behavior: 'auto',
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [
    open,
    state.selectedModeId,
    state.selectedNaturalKey,
    state.selectedPentatonicPositions.join(','),
  ]);

  const selectDiatonicEditingTarget = (modeId: string, key: NaturalKey) => {
    syncEditingTarget({ kind: 'diatonic', modeId, key });
  };

  const selectPentatonicEditingTarget = (
    modeId: string,
    key: NaturalKey,
    position: PentatonicShapePosition,
  ) => {
    syncEditingTarget({ kind: 'pentatonic', modeId, key, position });
  };

  const updateDiatonicWindow = (
    modeId: string,
    key: NaturalKey,
    patch: Partial<ModeKeyDefaultView>,
  ) => {
    const target: EditingTarget = { kind: 'diatonic', modeId, key };
    setEditingTarget(target);
    const current = getKeyDefaultView(state, modeId, key);
    dispatch({
      type: 'updateModeKeyDefaultView',
      modeId,
      key,
      view: { ...current, ...patch },
    });
    applyEditingTarget(dispatch, target);
  };

  const updatePentatonicWindow = (
    modeId: string,
    key: NaturalKey,
    position: PentatonicShapePosition,
    patch: Partial<PentatonicPositionDefaultView>,
  ) => {
    const target: EditingTarget = {
      kind: 'pentatonic',
      modeId,
      key,
      position,
    };
    setEditingTarget(target);
    const current = getPositionDefaultView(state, modeId, key, position);
    dispatch({
      type: 'updatePentatonicPositionDefaultView',
      modeId,
      key,
      position,
      view: { ...current, ...patch },
    });
    applyEditingTarget(dispatch, target);
  };

  const activeRange = getActiveRowRange(state, editingTarget);

  return (
    <dialog
      ref={dialogRef}
      className="settings-dialog"
      aria-labelledby="settings-dialog-title"
      onClose={handleClose}
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
    >
      <header className="settings-toolbar">
        <h2 id="settings-dialog-title">Layout defaults</h2>
        <div className="settings-toolbar-actions">
          <button
            type="button"
            className="small-action-button settings-reset-button"
            onClick={() => {
              dispatch({ type: 'resetLayoutConfig' });
              applyEditingTarget(dispatch, editingTarget);
            }}
          >
            Reset
          </button>
          <button
            type="button"
            className="settings-icon-button settings-close-icon"
            aria-label="Close settings"
            onClick={handleClose}
          >
            ×
          </button>
        </div>
      </header>

      <p className="settings-editing-label" data-testid="settings-editing-label">
        Active: {formatEditingLabel(editingTarget)} · {activeRange}
      </p>

      <div className="settings-dialog-body">
        <section className="settings-section">
          <h3 className="settings-section-title">Diatonic</h3>
          <div className="settings-table-wrap">
            <table className="settings-table settings-mode-table">
              <thead>
                <tr>
                  <th scope="col">Mode</th>
                  <th scope="col">Key</th>
                  <th scope="col">Start</th>
                  <th scope="col">Width</th>
                  <th scope="col">Range</th>
                </tr>
              </thead>
              <tbody>
                {DIATONIC_MODES.flatMap((mode) =>
                  NATURAL_KEYS.map((keyDef, keyIndex) => {
                    const key = keyDef.natural;
                    const defaults = getKeyDefaultView(state, mode.id, key);
                    const isEditing = isEditingTarget(
                      editingTarget,
                      mode.id,
                      key,
                    );

                    return (
                      <tr
                        key={`${mode.id}-${key}`}
                        ref={isEditing ? editingRowRef : undefined}
                        data-testid={
                          isEditing ? 'settings-editing-row' : undefined
                        }
                        className={[
                          isEditing ? 'is-editing-row' : '',
                          keyIndex === 0 ? 'is-mode-first-row' : '',
                          keyIndex === NATURAL_KEYS.length - 1
                            ? 'is-mode-last-row'
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onPointerDown={() =>
                          selectDiatonicEditingTarget(mode.id, key)
                        }
                      >
                        <td className="settings-mode-cell">
                          {keyIndex === 0 ? mode.shortName : ''}
                        </td>
                        <th scope="row">{keyDef.label}</th>
                        <td>
                          <input
                            type="number"
                            min={0}
                            max={24}
                            className="settings-number-input settings-compact-input"
                            aria-label={`${mode.shortName} ${keyDef.label} starting fret`}
                            value={defaults.selectedFretStart}
                            onPointerDown={() =>
                              selectDiatonicEditingTarget(mode.id, key)
                            }
                            onFocus={() => selectDiatonicEditingTarget(mode.id, key)}
                            onChange={(event) =>
                              updateDiatonicWindow(mode.id, key, {
                                selectedFretStart: Number(event.target.value),
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={3}
                            max={25}
                            className="settings-number-input settings-compact-input"
                            aria-label={`${mode.shortName} ${keyDef.label} window width`}
                            value={defaults.selectedFretWidth}
                            onPointerDown={() =>
                              selectDiatonicEditingTarget(mode.id, key)
                            }
                            onFocus={() => selectDiatonicEditingTarget(mode.id, key)}
                            onChange={(event) =>
                              updateDiatonicWindow(mode.id, key, {
                                selectedFretWidth: Number(event.target.value),
                              })
                            }
                          />
                        </td>
                        <td className="settings-range-cell">
                          {formatRange(
                            defaults.selectedFretStart,
                            defaults.selectedFretWidth,
                          )}
                        </td>
                      </tr>
                    );
                  }),
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="settings-section">
          <h3 className="settings-section-title">Pentatonic</h3>
          <div className="settings-table-wrap">
            <table className="settings-table settings-mode-table">
              <thead>
                <tr>
                  <th scope="col">Mode</th>
                  <th scope="col">Key</th>
                  <th scope="col">Pos</th>
                  <th scope="col">Start</th>
                  <th scope="col">Width</th>
                  <th scope="col">Range</th>
                  <th scope="col">Def</th>
                </tr>
              </thead>
              <tbody>
                {PENTATONIC_MODES.flatMap((mode) => {
                  const modePositions = getPentatonicPositionsForMode(mode.id);

                  return NATURAL_KEYS.flatMap((keyDef, keyIndex) =>
                    modePositions.map((position, positionIndex) => {
                      const key = keyDef.natural;
                      const defaults = getPositionDefaultView(
                        state,
                        mode.id,
                        key,
                        position,
                      );
                      const keyDefaults =
                        state.layoutConfig.pentatonicKeyDefaults[mode.id]?.[key];
                      const isDefault =
                        keyDefaults?.defaultPosition === position;
                      const isEditing = isEditingTarget(
                        editingTarget,
                        mode.id,
                        key,
                        position,
                      );
                      const isFirstKeyRow = positionIndex === 0;
                      const isLastKeyRow =
                        positionIndex === modePositions.length - 1;

                      return (
                        <tr
                          key={`${mode.id}-${key}-${position}`}
                          ref={isEditing ? editingRowRef : undefined}
                          data-testid={
                            isEditing ? 'settings-editing-row' : undefined
                          }
                          className={[
                            isEditing ? 'is-editing-row' : '',
                            keyIndex === 0 && positionIndex === 0
                              ? 'is-mode-first-row'
                              : '',
                            keyIndex === NATURAL_KEYS.length - 1 && isLastKeyRow
                              ? 'is-mode-last-row'
                              : '',
                            isFirstKeyRow ? 'is-key-first-row' : '',
                            isLastKeyRow ? 'is-key-last-row' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onPointerDown={() =>
                            selectPentatonicEditingTarget(mode.id, key, position)
                          }
                        >
                          <td className="settings-mode-cell">
                            {keyIndex === 0 && positionIndex === 0
                              ? mode.shortName
                              : ''}
                          </td>
                          <td className="settings-key-cell">
                            {isFirstKeyRow ? keyDef.label : ''}
                          </td>
                          <th scope="row">{position}</th>
                          <td>
                            <input
                              type="number"
                              min={0}
                              max={24}
                              className="settings-number-input settings-compact-input"
                              aria-label={`${mode.shortName} ${keyDef.label} position ${position} starting fret`}
                              value={defaults.selectedFretStart}
                              onPointerDown={() =>
                                selectPentatonicEditingTarget(mode.id, key, position)
                              }
                              onFocus={() =>
                                selectPentatonicEditingTarget(mode.id, key, position)
                              }
                              onChange={(event) =>
                                updatePentatonicWindow(mode.id, key, position, {
                                  selectedFretStart: Number(event.target.value),
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min={3}
                              max={25}
                              className="settings-number-input settings-compact-input"
                              aria-label={`${mode.shortName} ${keyDef.label} position ${position} window width`}
                              value={defaults.selectedFretWidth}
                              onPointerDown={() =>
                                selectPentatonicEditingTarget(mode.id, key, position)
                              }
                              onFocus={() =>
                                selectPentatonicEditingTarget(mode.id, key, position)
                              }
                              onChange={(event) =>
                                updatePentatonicWindow(mode.id, key, position, {
                                  selectedFretWidth: Number(event.target.value),
                                })
                              }
                            />
                          </td>
                          <td className="settings-range-cell">
                            {formatRange(
                              defaults.selectedFretStart,
                              defaults.selectedFretWidth,
                            )}
                          </td>
                          <td className="settings-default-cell">
                            <input
                              type="radio"
                              name={`default-${mode.id}-${key}`}
                              aria-label={`Default position for ${mode.shortName} ${keyDef.label}`}
                              checked={isDefault}
                              onChange={() => {
                                const target: EditingTarget = {
                                  kind: 'pentatonic',
                                  modeId: mode.id,
                                  key,
                                  position,
                                };
                                setEditingTarget(target);
                                dispatch({
                                  type: 'setPentatonicKeyDefaultPosition',
                                  modeId: mode.id,
                                  key,
                                  position,
                                });
                                applyEditingTarget(dispatch, target);
                              }}
                            />
                          </td>
                        </tr>
                      );
                    }),
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </dialog>
  );
}
