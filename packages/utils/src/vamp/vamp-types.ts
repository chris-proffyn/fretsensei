import type { NoteName, VampPlaybackState } from '../types';

export interface VampNote {
  noteName: NoteName;
  midi: number;
  frequency: number;
  role: 'root' | 'fifth';
}

export interface VampDyad {
  keyRoot: NoteName;
  displayRoot: string;
  root: VampNote;
  fifth: VampNote;
  displayLabel: string;
}

export interface VampOptions {
  rootGain?: number;
  fifthGain?: number;
  masterGain?: number;
  fadeMs?: number;
}

export interface VampEngine {
  initialise(): Promise<void>;
  start(dyad: VampDyad): Promise<void>;
  update(dyad: VampDyad): Promise<void>;
  stop(): void;
  dispose(): void;
}
