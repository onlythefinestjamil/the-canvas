// Keyboard shortcuts for the video editor (Final Cut / Premiere style).

export interface ShortcutHandler {
  space: () => void; // play/pause
  reverse: () => void; // J
  stop: () => void; // K
  forward: () => void; // L
  setIn: () => void; // I
  setOut: () => void; // O
  blade: () => void; // B
  select: () => void; // V
  undo: () => void; // Cmd/Ctrl+Z
  redo: () => void; // Cmd/Ctrl+Shift+Z
  save: () => void; // Cmd/Ctrl+S
  export: () => void; // Cmd/Ctrl+E
  prevEdit: () => void; // Up
  nextEdit: () => void; // Down
  frameStepBack: () => void; // Left
  frameStepFwd: () => void; // Right
  rippleDelete: () => void; // Delete
  zoomIn: () => void; // +
  zoomOut: () => void; // -
  selectAll: () => void; // A
}

export function attachShortcuts(el: HTMLElement, h: ShortcutHandler): () => void {
  const onKey = (e: KeyboardEvent) => {
    if (isTypingTarget(e.target)) return;
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) h.redo();
      else h.undo();
      return;
    }
    if (mod && e.key.toLowerCase() === 's') {
      e.preventDefault();
      h.save();
      return;
    }
    if (mod && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      h.export();
      return;
    }
    switch (e.key) {
      case ' ':
        e.preventDefault();
        h.space();
        break;
      case 'j':
      case 'J':
        h.reverse();
        break;
      case 'k':
      case 'K':
        h.stop();
        break;
      case 'l':
      case 'L':
        h.forward();
        break;
      case 'i':
      case 'I':
        h.setIn();
        break;
      case 'o':
      case 'O':
        h.setOut();
        break;
      case 'b':
      case 'B':
        h.blade();
        break;
      case 'v':
      case 'V':
        h.select();
        break;
      case 'a':
      case 'A':
        h.selectAll();
        break;
      case 'ArrowUp':
        e.preventDefault();
        h.prevEdit();
        break;
      case 'ArrowDown':
        e.preventDefault();
        h.nextEdit();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        h.frameStepBack();
        break;
      case 'ArrowRight':
        e.preventDefault();
        h.frameStepFwd();
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        h.rippleDelete();
        break;
      case '+':
      case '=':
        h.zoomIn();
        break;
      case '-':
      case '_':
        h.zoomOut();
        break;
      default:
        break;
    }
  };
  el.addEventListener('keydown', onKey);
  return () => el.removeEventListener('keydown', onKey);
}

function isTypingTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
}
