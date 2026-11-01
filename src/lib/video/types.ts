// Core domain types for the video editor (Final Cut / Premiere style).

export type TrackKind = 'video' | 'audio' | 'text' | 'effect';

export interface Track {
  id: string;
  kind: TrackKind;
  name: string;
  height: number;
  locked: boolean;
  muted: boolean;
  solo: boolean;
  hidden: boolean;
  volume: number; // 0..1 for audio
}

export type ClipSource =
  | { type: 'file'; url: string; fileName: string; mediaType: 'video' | 'audio' | 'image' }
  | { type: 'gallery'; url: string; mediaType: 'video' | 'image' }
  | { type: 'color'; color: string }; // color matte / solid background

export interface Keyframe<T = number> {
  id: string;
  time: number; // seconds, relative to clip start
  value: T;
  interpolation: 'linear' | 'bezier' | 'hold';
  // bezier easing handles (0..1 each)
  easeIn?: [number, number];
  easeOut?: [number, number];
}

export interface ColorAdjust {
  brightness: number; // -1..1, 0 default
  contrast: number; // -1..1
  saturation: number; // -1..1
  temperature: number; // -1..1
  tint: number; // -1..1
  hue: number; // -180..180 deg
}

export interface FilterDef {
  id: string;
  name: string;
  intensity: number; // 0..1
}

export interface ClipEffects {
  color: ColorAdjust;
  filters: FilterDef[];
  blur: number; // px
  sharpen: number; // 0..1
  vignette: number; // 0..1
  motionBlur: number; // 0..1
  stabilization: number; // 0..1
  speedRamp: number[]; // control points in [time, speed] pairs
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: 'left' | 'center' | 'right';
  background: string | null;
  stroke: string | null;
  strokeWidth: number;
  shadow: boolean;
}

export type TextAnimation = 'none' | 'fade' | 'slide' | 'typewriter' | 'bounce' | 'scale';

export interface TextOverlay {
  id: string;
  text: string;
  style: TextStyle;
  x: number; // 0..1 of width
  y: number; // 0..1 of height
  animation: TextAnimation;
  animationDuration: number; // seconds
}

export type TransitionType =
  | 'cross-dissolve'
  | 'fade-black'
  | 'fade-white'
  | 'wipe-left'
  | 'wipe-right'
  | 'wipe-up'
  | 'wipe-down'
  | 'slide'
  | 'push'
  | 'zoom'
  | 'whip-pan'
  | 'glitch'
  | 'morph-cut';

export interface Transition {
  id: string;
  type: TransitionType;
  duration: number; // seconds
}

export interface Clip {
  id: string;
  trackId: string;
  source: ClipSource;
  // Timeline placement (absolute, seconds).
  start: number;
  duration: number; // visible duration on the timeline (after speed)
  // Source trim points (seconds within the source media).
  inPoint: number;
  outPoint: number;
  speed: number; // 0.25..4 (1 = normal; negative = reverse handled by flag)
  reverse: boolean;
  volume: number; // 0..1
  fadeIn: number; // seconds
  fadeOut: number; // seconds
  transitionIn?: Transition;
  transitionOut?: Transition;
  effects: ClipEffects;
  text?: TextOverlay; // for text tracks
  // Cached metadata for rendering (filled at import).
  naturalWidth?: number;
  naturalHeight?: number;
  sourceDuration?: number; // total seconds of the underlying media
  thumbnail?: string; // data URL or remote URL used for timeline strip
  label?: string;
}

export interface VideoProject {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  width: number;
  height: number;
  fps: number;
  duration: number; // computed project length (seconds)
  tracks: Track[];
  clips: Clip[];
  // Background color for empty frames.
  background: string;
}

export const DEFAULT_COLOR: ColorAdjust = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  tint: 0,
  hue: 0,
};

export const DEFAULT_EFFECTS: ClipEffects = {
  color: { ...DEFAULT_COLOR },
  filters: [],
  blur: 0,
  sharpen: 0,
  vignette: 0,
  motionBlur: 0,
  stabilization: 0,
  speedRamp: [],
};

export const uid = (prefix = 'id'): string =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
