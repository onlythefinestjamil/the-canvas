const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export interface GenerationRequest {
  description: string;
  quality: "high" | "fast";
  voice: string;
  voiceover: boolean;
  captions: string | null;
}

export interface CreditSummary {
  totalGenerations: number;
  localCount: number;
  apiCount: number;
  totalCost: number;
}

export async function fetchCredits(): Promise<CreditSummary> {
  const res = await fetch(`${API_BASE}/api/credits`);
  if (!res.ok) throw new Error("Failed to fetch credits");
  const data = await res.json();
  return {
    totalGenerations: data.total_local + data.total_api,
    localCount: data.total_local,
    apiCount: data.total_api,
    totalCost: data.total_cost,
  };
}

export function createWebSocket(): WebSocket {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = process.env.NEXT_PUBLIC_WS_URL || `${API_BASE.replace(/^https?/, "")}`;
  return new WebSocket(`${protocol}://${host}/ws`);
}

export function sendGenerationRequest(
  ws: WebSocket,
  req: GenerationRequest
): void {
  ws.send(
    JSON.stringify({
      type: "generate",
      ...req,
    })
  );
}
