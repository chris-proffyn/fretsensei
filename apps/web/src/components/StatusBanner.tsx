import type { PlaybackStatus } from '@fretsensei/utils';

interface StatusBannerProps {
  status: PlaybackStatus;
  bpmMessage?: string | null;
}

export function StatusBanner({ status, bpmMessage }: StatusBannerProps) {
  const message = bpmMessage ?? status.message;

  if (!message) {
    return null;
  }

  return (
    <p
      className="status-banner"
      role="status"
      aria-live="polite"
      data-testid="status-banner"
    >
      {message}
    </p>
  );
}
