"use client";

import { useCanvasStore } from "@/store/canvas";
import { useEffect, useRef } from "react";
import {
  createWebSocket,
  sendGenerationRequest,
  fetchCredits,
  type GenerationRequest,
} from "@/lib/api";
import { GeneratePanel } from "@/components/GeneratePanel";
import { PreviewPanel } from "@/components/PreviewPanel";
import { CreditDashboard } from "@/components/CreditDashboard";
import { Header } from "@/components/Header";

export default function HomePage() {
  const {
    description,
    quality,
    voiceover,
    captions,
    voice,
    isGenerating,
    setProgress,
    setOutput,
    setGenerating,
    setCredits,
  } = useCanvasStore();

  const wsRef = useRef<WebSocket | null>(null);

  // Load credits on mount
  useEffect(() => {
    fetchCredits()
      .then(setCredits)
      .catch(() => {});
  }, [setCredits]);

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setGenerating(true);
    setProgress({ status: "planning", message: "Parsing your prompt..." });
    setOutput(null);

    const ws = createWebSocket();
    wsRef.current = ws;

    ws.onopen = () => {
      const req: GenerationRequest = {
        description,
        quality,
        voice,
        voiceover,
        captions: captions === "none" ? null : captions,
      };
      sendGenerationRequest(ws, req);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "progress") {
        setProgress({
          status: msg.status as any,
          message: msg.message || "",
          shot: msg.shots,
          totalShots: msg.shots,
          duration: msg.duration,
          aspect: msg.aspect,
          contentType: msg.content_type,
        });
      } else if (msg.type === "heartbeat") {
        setProgress((p) => ({ ...p, status: "generating" }));
      } else if (msg.type === "done") {
        setProgress({ status: "done", message: "Complete!" });
        setOutput(msg.output_path || null);
        setGenerating(false);
        // Refresh credits
        fetchCredits().then(setCredits).catch(() => {});
        ws.close();
      } else if (msg.type === "error") {
        setProgress({ status: "error", message: msg.message, error: msg.message });
        setGenerating(false);
        ws.close();
      }
    };

    ws.onerror = () => {
      setProgress({ status: "error", message: "Connection lost", error: "WebSocket error" });
      setGenerating(false);
    };

    ws.onclose = () => {
      if (isGenerating) {
        setGenerating(false);
      }
    };
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Generation Controls */}
          <div className="space-y-6">
            <GeneratePanel onGenerate={handleGenerate} />
          </div>

          {/* Right: Real-time Preview + Output */}
          <div className="space-y-6">
            <PreviewPanel />
          </div>
        </div>

        {/* Bottom: Credits & History */}
        <div className="mt-8">
          <CreditDashboard />
        </div>
      </main>
    </div>
  );
}
