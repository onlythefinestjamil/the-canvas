// Transition definitions and per-frame progress/easing.

import type { Transition, TransitionType } from './types';
import { uid } from './types';

export interface TransitionDef {
  type: TransitionType;
  label: string;
  group: 'dissolve' | 'fade' | 'wipe' | 'motion' | 'stylized';
}

export const TRANSITIONS: TransitionDef[] = [
  { type: 'cross-dissolve', label: 'Cross Dissolve', group: 'dissolve' },
  { type: 'fade-black', label: 'Fade to Black', group: 'fade' },
  { type: 'fade-white', label: 'Fade to White', group: 'fade' },
  { type: 'wipe-left', label: 'Wipe Left', group: 'wipe' },
  { type: 'wipe-right', label: 'Wipe Right', group: 'wipe' },
  { type: 'wipe-up', label: 'Wipe Up', group: 'wipe' },
  { type: 'wipe-down', label: 'Wipe Down', group: 'wipe' },
  { type: 'slide', label: 'Slide', group: 'motion' },
  { type: 'push', label: 'Push', group: 'motion' },
  { type: 'zoom', label: 'Zoom', group: 'motion' },
  { type: 'whip-pan', label: 'Whip Pan', group: 'motion' },
  { type: 'glitch', label: 'Glitch', group: 'stylized' },
  { type: 'morph-cut', label: 'Morph Cut', group: 'stylized' },
];

export function makeTransition(type: TransitionType, duration = 0.5): Transition {
  return { id: uid('tr'), type, duration };
}

/** Progress 0..1 across the transition window. */
export function transitionProgress(time: number, start: number, duration: number): number {
  return Math.max(0, Math.min(1, (time - start) / Math.max(1e-3, duration)));
}

/** Eased progress (ease in-out cubic). */
export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
