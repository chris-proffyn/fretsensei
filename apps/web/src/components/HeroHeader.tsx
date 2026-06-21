import { APP_DESCRIPTION, APP_TITLE } from '@fretsensei/utils';
import { useEffect, useRef, useState } from 'react';

function InfoIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export function HeroHeader() {
  const [infoOpen, setInfoOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleClose = () => {
    dialogRef.current?.close();
    setInfoOpen(false);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (infoOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!infoOpen && dialog.open) {
      dialog.close();
    }
  }, [infoOpen]);

  return (
    <header className="hero">
      <div className="hero-title-row">
        <picture>
          <source srcSet="/logo-lite.svg" media="(prefers-color-scheme: dark)" />
          <img src="/logo.svg" alt="ModeWise" className="hero-logo" />
        </picture>
        <h1>{APP_TITLE}</h1>
        <button
          type="button"
          className="hero-info-button"
          aria-label="About this app"
          title="About this app"
          onClick={() => setInfoOpen(true)}
        >
          <InfoIcon />
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="app-info-dialog"
        aria-labelledby="app-info-title"
        onClose={() => setInfoOpen(false)}
        onCancel={(event) => {
          event.preventDefault();
          handleClose();
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            handleClose();
          }
        }}
      >
        <div className="app-info-dialog-body">
          <div className="app-info-dialog-header">
            <h2 id="app-info-title">About ModeWise</h2>
            <button
              type="button"
              className="app-info-close-button"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
          <p>{APP_DESCRIPTION}</p>
        </div>
      </dialog>
    </header>
  );
}
