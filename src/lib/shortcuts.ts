// Keyboard shortcuts for the editor.
export type ToolId =
  | 'move' | 'brush' | 'pencil' | 'eraser' | 'fill' | 'eyedropper'
  | 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'text'
  | 'crop' | 'lasso' | 'wand' | 'rect-select' | 'clone' | 'heal';

export interface ShortcutDef {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: string;
  label: string;
}

export const TOOL_SHORTCUTS: Record<string, ToolId> = {
  v: 'move',
  b: 'brush',
  p: 'pencil',
  e: 'eraser',
  g: 'fill',
  i: 'eyedropper',
  r: 'rectangle',
  o: 'ellipse',
  l: 'lasso',
  w: 'wand',
  t: 'text',
  c: 'crop',
  h: 'heal',
  s: 'clone',
};

export const ACTION_SHORTCUTS: ShortcutDef[] = [
  { key: 'z', ctrl: true, action: 'undo', label: 'Undo' },
  { key: 'z', ctrl: true, shift: true, action: 'redo', label: 'Redo' },
  { key: 'y', ctrl: true, action: 'redo', label: 'Redo' },
  { key: 's', ctrl: true, action: 'save', label: 'Save' },
  { key: 's', ctrl: true, shift: true, action: 'export', label: 'Export' },
  { key: 'n', ctrl: true, action: 'new', label: 'New' },
  { key: 'o', ctrl: true, action: 'open', label: 'Open' },
  { key: 't', ctrl: true, action: 'transform', label: 'Transform' },
  { key: 'j', ctrl: true, action: 'duplicate-layer', label: 'Duplicate layer' },
  { key: 'd', ctrl: true, action: 'deselect', label: 'Deselect' },
  { key: 'a', ctrl: true, action: 'select-all', label: 'Select all' },
  { key: 'i', ctrl: true, action: 'invert-selection', label: 'Invert selection' },
];

export function brushSizeKey(key: string): 'increase' | 'decrease' | null {
  if (key === '[') return 'decrease';
  if (key === ']') return 'increase';
  return null;
}
