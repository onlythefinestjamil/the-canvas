"use client";

import { useCanvasStore } from "@/store/canvas";
import { useEffect, useState } from "react";
import { fetchCredits, type CreditSummary } from "@/lib/api";

export function Header() {
  const { credits, setCredits } = useCanvasStore();
  const [online, setOnline] = useState(false);

  useEffect(() => {
    // Check if backend is reachable
    fetch("http://localhost:8787/api/status")
      .then(() => setOnline(true))
      .catch(() => setOnline(false));

    fetchCredits()
      .then(setCredits)
      .catch(() => {});
  }, [setCredits]);

  return (
    <header className="border-b border-border bg-bg2/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center text-white font-bold text-lg">
            C
          </div>
          <div>
            <div className="font-bold text-lg gradient-text">The Canvas</div>
            <div className="text-xs text-muted">AI Creative Studio</div>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-4">
          {/* Backend status */}
          <div className="flex items-center gap-2 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                online ? "bg-success shadow-[0_0_8px_#28e5a0]" : "bg-danger"
              }`}
            />
            <span className="text-muted">
              {online ? "Engine online" : "Engine offline"}
            </span>
          </div>

          {/* Credits */}
          {credits && (
            <div className="flex items-center gap-3 text-xs">
              <div className="px-3 py-1.5 rounded-lg bg-card border border-border">
                <span className="text-muted">Gen: </span>
                <span className="text-white font-semibold">
                  {credits.totalGenerations}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-card border border-border">
                <span className="text-muted">Cost: </span>
                <span className="text-success font-semibold">
                  ${credits.totalCost.toFixed(2)}
                </span>
              </div>
              {credits.apiCount > 0 && (
                <div className="px-3 py-1.5 rounded-lg bg-card border border-border">
                  <span className="text-muted">Local: </span>
                  <span className="text-success">
                    {credits.localCount}
                  </span>
                  <span className="text-muted"> / API: </span>
                  <span className="text-accent2">
                    {credits.apiCount}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
