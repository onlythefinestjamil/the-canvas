"use client";

import { useCanvasStore } from "@/store/canvas";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Film } from "lucide-react";

export function PreviewPanel() {
  const { progress, outputUrl, isGenerating } = useCanvasStore();

  // Idle state
  if (progress.status === "idle" && !outputUrl) {
    return (
      <div className="glass rounded-2xl p-6 min-h-[400px] flex flex-col items-center justify-center">
        <Film className="w-16 h-16 text-muted/30 mb-4" />
        <h3 className="text-lg font-semibold text-muted">Preview</h3>
        <p className="text-sm text-muted/60 mt-2 text-center max-w-xs">
 Your generated content will appear here in real-time
        </p>
      </div>
    );
  }

  // Error state
  if (progress.status === "error") {
    return (
      <div className="glass rounded-2xl p-6 min-h-[400px] flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-danger mb-4" />
        <h3 className="text-lg font-semibold text-danger">Generation Failed</h3>
        <p className="text-sm text-muted mt-2 text-center max-w-xs">
          {progress.error || progress.message}
        </p>
      </div>
    );
  }

  // Done state with output
  if (progress.status === "done" && outputUrl) {
    const filename = outputUrl.split(/[/\\]/).pop() || "output.mp4";
    return (
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <h3 className="text-lg font-semibold text-success">Complete!</h3>
        </div>
        <video
          className="w-full rounded-xl border border-border"
          controls
          autoPlay
          loop
        >
          <source src={`/api/output/${filename}`} type="video/mp4" />
        </video>
        <div className="mt-3 text-xs text-muted">
          Saved: {outputUrl}
        </div>
      </div>
    );
  }

  // Generating state — real-time progress
  const statusSteps = [
    { key: "planning", label: "Parsing prompt", icon: Sparkles },
    { key: "generating", label: "Generating assets", icon: Loader2 },
    { key: "compositing", label: "Compositing", icon: Film },
  ];

  const currentStepIndex = statusSteps.findIndex(
    (s) => s.key === progress.status
  );

  return (
    <div className="glass rounded-2xl p-6 min-h-[400px]">
      {/* Progress header */}
      <div className="flex items-center gap-3 mb-6">
        <Loader2 className="w-5 h-5 text-accent animate-spin" />
        <h3 className="text-lg font-semibold">{progress.message}</h3>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full gradient-btn transition-all duration-500"
            style={{
              width: `${progress.totalShots ? 100 : 30}%`,
            }}
          />
        </div>
      </div>

      {/* Plan details */}
      {(progress.contentType || progress.duration || progress.aspect) && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-bg rounded-xl p-3 border border-border">
            <div className="text-xs text-muted mb-1">Type</div>
            <div className="text-sm font-medium capitalize">
              {progress.contentType || "—"}
            </div>
          </div>
          <div className="bg-bg rounded-xl p-3 border border-border">
            <div className="text-xs text-muted mb-1">Duration</div>
            <div className="text-sm font-medium">
              {progress.duration ? `${progress.duration}s` : "—"}
            </div>
          </div>
          <div className="bg-bg rounded-xl p-3 border border-border">
            <div className="text-xs text-muted mb-1">Aspect</div>
            <div className="text-sm font-medium">
              {progress.aspect || "—"}
            </div>
          </div>
        </div>
      )}

      {/* Step indicators */}
      <div className="space-y-3">
        {statusSteps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentStepIndex;
          const isDone = i < currentStepIndex;
          return (
            <div
              key={step.key}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all",
                isActive
                  ? "border-accent bg-accent/5"
                  : isDone
                  ? "border-success/30 bg-success/5"
                  : "border-border bg-bg/50"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isActive
                    ? "bg-accent text-white"
                    : isDone
                    ? "bg-success/20 text-success"
                    : "bg-border text-muted"
                )}
              >
                {isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-sm",
                  isActive ? "text-white" : isDone ? "text-success" : "text-muted"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Live shot counter */}
      {progress.totalShots && (
        <div className="mt-6 p-4 bg-bg rounded-xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted">Shots Progress</span>
            <span className="text-xs text-accent2 font-mono">
              {progress.shot || 0} / {progress.totalShots}
            </span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full gradient-btn transition-all duration-300"
              style={{
                width: `${((progress.shot || 0) / (progress.totalShots || 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
