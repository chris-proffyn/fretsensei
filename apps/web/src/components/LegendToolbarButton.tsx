import { useState } from 'react';
import { Legend } from './Legend';
import { PickerModal } from './PickerModal';
import { LegendIcon } from './ToolbarIcons';

export function LegendToolbarButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="toolbar-icon-button"
        data-testid="toolbar-legend-button"
        aria-haspopup="dialog"
        aria-label="Note legend"
        title="Note legend"
        onClick={() => setOpen(true)}
      >
        <LegendIcon />
      </button>

      <PickerModal
        open={open}
        title="Legend"
        titleId="toolbar-legend-modal-title"
        onClose={() => setOpen(false)}
      >
        <Legend modal />
      </PickerModal>
    </>
  );
}
