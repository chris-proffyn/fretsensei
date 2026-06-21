import type { ReactNode } from 'react';

function IconFrame({ children }: { children: ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function PlayIcon() {
  return (
    <IconFrame>
      <path
        d="M8.5 6.2 C8.5 5.4 9.4 4.9 10.1 5.4 L18.6 11.2 C19.2 11.6 19.2 12.4 18.6 12.8 L10.1 18.6 C9.4 19.1 8.5 18.6 8.5 17.8 V6.2 Z"
        fill="currentColor"
      />
    </IconFrame>
  );
}

export function StopIcon() {
  return (
    <IconFrame>
      <rect
        x="7"
        y="7"
        width="10"
        height="10"
        rx="1.5"
        fill="currentColor"
      />
    </IconFrame>
  );
}
