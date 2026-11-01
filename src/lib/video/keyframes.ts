// Keyframe evaluation and interpolation.

import type { Keyframe } from './types';

/** Sort keyframes by time. */
export function sortKeyframes<T>(kf: Keyframe<T>[]): Keyframe<T>[] {
  return [...kf].sort((a, b) => a.time - b.time);
}

function cubicBezierEase(t: number, p1: [number, number], p2: [number, number]): number {
  // Cubic bezier where p0=(0,0), p3=(1,1) and control points p1, p2.
  // Solve for the t that yields progress value given parameter t (approx via Newton).
  const cx = 3 * p1[0];
  const bx = 3 * (p2[0] - p1[0]) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1[1];
  const by = 3 * (p2[1] - p1[1]) - cy;
  const ay = 1 - cy - by;
  // Solve x(t) = t for the bezier parameter using a few Newton iterations.
  let x = t;
  for (let i = 0; i < 8; i++) {
    const v = ((ax * x + bx) * x + cx) * x - t;
    const d = (3 * ax * x + 2 * bx) * x + cx;
    if (Math.abs(d) < 1e-6) break;
    x -= v / d;
  }
  return ((ay * x + by) * x + cy) * x;
}

/** Evaluate the value of a property at a given time across a sorted keyframe list. */
export function evaluateKeyframes<T extends number>(
  time: number,
  keyframes: Keyframe<T>[]
): T | null {
  if (!keyframes.length) return null;
  const sorted = sortKeyframes(keyframes);
  if (time <= sorted[0].time) return sorted[0].value;
  if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (time >= a.time && time <= b.time) {
      if (a.interpolation === 'hold') return a.value;
      const localT = (time - a.time) / Math.max(1e-6, b.time - a.time);
      if (a.interpolation === 'bezier') {
        const eased = cubicBezierEase(localT, a.easeOut ?? [0.4, 0], b.easeIn ?? [0.6, 1]);
        return (a.value + (b.value - a.value) * eased) as T;
      }
      // linear
      return (a.value + (b.value - a.value) * localT) as T;
    }
  }
  return sorted[sorted.length - 1].value;
}

export function addKeyframe<T extends number>(
  keyframes: Keyframe<T>[],
  time: number,
  value: T,
  interpolation: Keyframe<T>['interpolation'] = 'linear'
): Keyframe<T>[] {
  const next = keyframes.filter((k) => Math.abs(k.time - time) > 1e-3);
  return sortKeyframes([...next, { id: `kf_${Math.random().toString(36).slice(2, 10)}`, time, value, interpolation }]);
}

export function removeKeyframe<T>(keyframes: Keyframe<T>[], id: string): Keyframe<T>[] {
  return keyframes.filter((k) => k.id !== id);
}
