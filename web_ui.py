"""
The Canvas — Enhanced Web UI Backend
FastAPI + WebSocket + Multi-Model Router + Cloud GPU

Endpoints:
  GET  /                  — Web UI (fallback HTML)
  GET  /api/status        — Router + engine status
  GET  /api/models        — List available models by capability
  GET  /api/credits       — Generation history + costs
  POST /api/generate      — REST generation (alternative to WebSocket)
  WS   /ws                — Real-time generation with progress
"""
import os
import json
import asyncio
import threading
import traceback
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rich.console import Console

console = Console()
app = FastAPI(title="The Canvas", version="0.1.0")

# CORS — allow the React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Globals ───
pipeline = None
router = None
connected_websockets = []


def get_pipeline():
    global pipeline
    if pipeline is None:
        from the_canvas.pipeline import CanvasPipeline
        pipeline = CanvasPipeline("config.yaml")
    return pipeline


def get_router():
    global router
    if router is None:
        from the_canvas.model_router import ModelRouter
        from the_canvas.config import CanvasConfig
        cfg = CanvasConfig.load("config.yaml")
        router = ModelRouter(cfg)
    return router


# ─── Request Models ───
class GenerateRequest(BaseModel):
    description: str
    quality: str = "high"
    voice: str = "af_heart"
    voiceover: bool = True
    captions: Optional[str] = None


# ─── Routes ───
@app.get("/")
async def index():
    html = Path(__file__).parent / "web" / "index.html"
    if html.exists():
        return HTMLResponse(html.read_text())
    return HTMLResponse("<h1>The Canvas — API running. Frontend at :3000</h1>")


@app.get("/api/status")
async def status():
    r = get_router()
    return JSONResponse(r.status())


@app.get("/api/models")
async def list_models(capability: Optional[str] = None):
    r = get_router()
    return JSONResponse(r.list_available_models(capability))


@app.get("/api/credits")
async def credits():
    try:
        p = get_pipeline()
        return JSONResponse({
            "summary": p.credits.summary(),
            "total_cost": p.credits.total_cost(),
            "total_local": p.credits.total_local(),
            "total_api": p.credits.total_api(),
            "entries": p.credits.entries[-50:],
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/api/generate")
async def generate_rest(req: GenerateRequest):
    """REST API generation (no WebSocket — for programmatic use)."""
    try:
        p = get_pipeline()
        output = p.create(
            description=req.description,
            quality=req.quality,
            voice=req.voice,
            include_voiceover=req.voiceover,
            caption_style=req.captions,
        )
        return JSONResponse({"status": "done", "output_path": output})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.get("/api/output/{filename}")
async def get_output(filename: str):
    """Serve generated output files."""
    safe = Path(filename).name
    p = get_pipeline()
    output_dir = Path(p.config.output_dir)
    filepath = output_dir / safe
    if filepath.exists():
        return FileResponse(str(filepath))
    return JSONResponse({"error": "File not found"}, status_code=404)


# ─── WebSocket ───
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    connected_websockets.append(ws)
    try:
        while True:
            data = await ws.receive_text()
            msg = json.loads(data)

            if msg.get("type") == "generate":
                await _run_generation(
                    ws,
                    msg.get("description", ""),
                    msg.get("quality", "high"),
                    msg.get("voice", "af_heart"),
                    msg.get("voiceover", True),
                    msg.get("captions"),
                )

    except WebSocketDisconnect:
        if ws in connected_websockets:
            connected_websockets.remove(ws)
    except Exception as e:
        console.print(f"[red]WebSocket error: {e}[/red]")
        if ws in connected_websockets:
            connected_websockets.remove(ws)


async def _run_generation(ws, description, quality, voice, include_voiceover, caption_style):
    """Run generation in a thread, send progress via WebSocket."""
    loop = asyncio.get_event_loop()

    def send(status, message="", data=None):
        update = {"type": "progress", "status": status, "message": message}
        if data:
            update.update(data)
        asyncio.run_coroutine_threadsafe(ws.send_json(update), loop)

    def run_sync():
        try:
            send("planning", "Parsing your prompt...")
            p = get_pipeline()

            from the_canvas.prompt_parser import parse_prompt
            plan = parse_prompt(description)

            send("plan", f"Plan: {len(plan.shots)} shots, {plan.total_duration_s}s", {
                "shots": len(plan.shots),
                "duration": plan.total_duration_s,
                "aspect": plan.aspect_ratio,
                "content_type": plan.content_type,
            })

            output = p.create(
                description=description,
                quality=quality,
                voice=voice,
                include_voiceover=include_voiceover,
                caption_style=caption_style,
            )

            send("done", f"Complete: {output}", {"output_path": output})

        except Exception as e:
            send("error", str(e))
            console.print(f"[red]Generation error: {e}[/red]")
            traceback.print_exc()

    thread = threading.Thread(target=run_sync)
    thread.start()

    while thread.is_alive():
        await asyncio.sleep(1)
        try:
            await ws.send_json({"type": "heartbeat", "status": "generating"})
        except Exception:
            break

    thread.join()


# ─── Startup ───
@app.on_event("startup")
async def startup():
    console.print("\n[bold cyan]═══ The Canvas — Backend ═══[/bold cyan]\n")
    console.print("[green]API: http://localhost:8787[/green]")
    console.print("[green]WebSocket: ws://localhost:8787/ws[/green]")
    console.print("[green]Frontend: http://localhost:3000[/green]\n")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8787)
