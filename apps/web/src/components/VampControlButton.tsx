interface VampControlButtonProps {
  isPlaying: boolean;
  dyadLabel: string;
  onToggle: () => void;
  disabled?: boolean;
}

export function VampControlButton({
  isPlaying,
  dyadLabel,
  onToggle,
  disabled = false,
}: VampControlButtonProps) {
  const buttonLabel = isPlaying ? 'Stop' : 'Vamp';

  return (
    <button
      type="button"
      className={isPlaying ? 'vamp-button vamp-button-active' : 'vamp-button'}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? `Stop ${dyadLabel}` : `Start ${dyadLabel}`}
      disabled={disabled}
      data-testid="vamp-button"
      onClick={onToggle}
    >
      {buttonLabel}
    </button>
  );
}
