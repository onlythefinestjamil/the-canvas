// Selection action toolbar: select all, deselect, invert.
import { Square, SquareDashedMousePointer, FlipHorizontal2 } from 'lucide-react';
import type { Selection } from '../lib/selection';

interface Props {
  selection: Selection | null;
  onSelectAll: () => void;
  onDeselect: () => void;
  onInvert: () => void;
}

export default function SelectionToolbar({ selection, onSelectAll, onDeselect, onInvert }: Props) {
  if (!selection) return null;
  return (
    <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.3rem', zIndex: 50, background: 'var(--surface-2)', border: '1px solid var(--border-bright)', borderRadius: 8, padding: '0.2rem' }}>
      <button className="icon-btn" style={{ padding: '0.3rem' }} onClick={onSelectAll} title="Select all (Ctrl+A)"><Square size={13} /></button>
      <button className="icon-btn" style={{ padding: '0.3rem' }} onClick={onDeselect} title="Deselect (Ctrl+D)"><SquareDashedMousePointer size={13} /></button>
      <button className="icon-btn" style={{ padding: '0.3rem' }} onClick={onInvert} title="Invert (Ctrl+Shift+I)"><FlipHorizontal2 size={13} /></button>
    </div>
  );
}
