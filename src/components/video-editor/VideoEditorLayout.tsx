// Top-level video editor layout shell (menu bar + preview + inspector + timeline + media).
import type { ReactNode } from 'react';

interface Props {
  menuBar?: ReactNode;
  left?: ReactNode;
  toolbar?: ReactNode;
  preview?: ReactNode;
  inspector?: ReactNode;
  libPanel?: ReactNode;
  timeline?: ReactNode;
}

export default function VideoEditorLayout({ menuBar, left, toolbar, preview, inspector, libPanel, timeline }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', background: 'var(--bg)' }} tabIndex={0}>
      {menuBar}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {left && (
          <div style={{ width: 240, flexShrink: 0, borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
            {left}
          </div>
        )}
        {toolbar}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>{preview}</div>
            <div style={{ width: 320, flexShrink: 0, borderLeft: '1px solid var(--border)', overflow: 'hidden' }}>{inspector}</div>
          </div>
          <div style={{ display: 'flex', height: '38%', minHeight: 200, borderTop: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ width: 260, flexShrink: 0, borderRight: '1px solid var(--border)', overflow: 'hidden' }}>{libPanel}</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>{timeline}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
