import { useEffect, useRef } from 'react';

interface PickerModalProps {
  open: boolean;
  title: string;
  titleId: string;
  onClose: () => void;
  dialogClassName?: string;
  children: React.ReactNode;
}

export function PickerModal({
  open,
  title,
  titleId,
  onClose,
  dialogClassName,
  children,
}: PickerModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

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

  return (
    <dialog
      ref={dialogRef}
      className={`picker-dialog${dialogClassName ? ` ${dialogClassName}` : ''}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="picker-dialog-header">
        <h2 id={titleId} className="picker-dialog-title">
          {title}
        </h2>
        <button
          type="button"
          className="picker-dialog-close"
          aria-label={`Close ${title.toLowerCase()}`}
          onClick={onClose}
        >
          ×
        </button>
      </header>
      <div className="picker-dialog-body">{children}</div>
    </dialog>
  );
}
