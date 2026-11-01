// Photoshop-style editor layout shell — composes the menu bar, left toolbar,
// central canvas, and right panel into the standard photo-editor arrangement.
// PhotoEditor.tsx implements this layout directly; this is the reusable shell.
import type { ReactNode } from 'react';

interface Props {
  menuBar?: ReactNode;
  toolbar?: ReactNode;
  canvas?: ReactNode;
  rightPanel?: ReactNode;
  statusBar?: ReactNode;
}

export default function EditorLayout({ menuBar, toolbar, canvas, rightPanel, statusBar }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', background: 'var(--bg)' }}>
      {menuBar}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {toolbar}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {canvas}
          {statusBar}
        </div>
        {rightPanel}
      </div>
    </div>
  );
}
