"""
Multi-Model Router — decides which backend to use for each generation.

Decision tree:
1. If user requests local → try local (RX 6800 + 128GB RAM)
2. If user requests API → route to fal.ai or Replicate
3. If local fails (OOM, timeout) → auto-fallback to API
4. If cloud GPU configured → route to RunPod/Vast.ai

This is the brain that makes The Canvas flexible — works on your hardware,
on cloud GPUs, or via APIs. Melene runs it on her machine; it also deploys.
"""
import os
import time
from typing import Optional, Literal
from dataclasses import dataclass
from rich.console import Console

console = Console()


BackendType = Literal["local", "fal_ai", "replicate", "runpod", "vast"]


@dataclass
class RouteDecision:
    """Decision about where to route a generation."""
    backend: BackendType
    model_name: str
    reason: str
    estimated_cost: float
    estimated_time_s: float


class ModelRouter:
    """Routes generation requests to the best available backend."""

    def __init__(self, config):
        self.config = config
        self.local_available = False  # Set by Melene after testing
        self.local_gpu_vram = 16  # GB — RX 6800
        self.local_ram = 128  # GB — DDR5
        self.api_enabled = config.api.get("enabled", False)
        self.fal_api_key = config.api.get("fal_ai", {}).get("api_key", "")
        self.replicate_api_key = config.api.get("replicate", {}).get("api_key", "")
        self.cloud_gpu_enabled = config.api.get("cloud_gpu", {}).get("enabled", False)

        # Model registry — what's available where
        self.models = {
            "image": {
                "flux_klein": {
                    "name": "FLUX.2 Klein 4B",
                    "license": "Apache 2.0",
                    "local": True,
                    "vram_gb": 13,
                    "api": "fal.ai/flux",
                    "api_cost": 0.01,
                    "local_cost": 0.0,
                },
                "qwen_image": {
                    "name": "Qwen-Image 2.0",
                    "license": "Apache 2.0",
                    "local": True,
                    "vram_gb": 16,
                    "api": None,
                    "api_cost": 0.0,
                    "local_cost": 0.0,
                },
            },
            "video": {
                "wan_22_a14b": {
                    "name": "Wan 2.2 T2V A14B",
                    "license": "Apache 2.0",
                    "local": True,
                    "vram_gb": 16,  # With CPU offload
                    "needs_offload": True,
                    "api": "fal.ai/wan-2.2",
                    "api_cost": 0.50,
                    "local_cost": 0.0,
                    "local_time_s": 600,  # ~10 min with offload
                    "api_time_s": 30,
                },
                "wan_22_5b": {
                    "name": "Wan 2.2 TI2V 5B",
                    "license": "Apache 2.0",
                    "local": True,
                    "vram_gb": 24,
                    "needs_offload": True,
                    "api": "fal.ai/wan-2.2",
                    "api_cost": 0.30,
                    "local_cost": 0.0,
                    "local_time_s": 300,
                    "api_time_s": 20,
                },
                "ltx_23": {
                    "name": "LTX-2.3",
                    "license": "Apache 2.0",
                    "local": True,
                    "vram_gb": 8,
                    "needs_offload": False,
                    "api": "fal.ai/ltx",
                    "api_cost": 0.10,
                    "local_cost": 0.0,
                    "local_time_s": 60,
                    "api_time_s": 10,
                },
                "hunyvideo": {
                    "name": "HunyuanVideo 1.5",
                    "license": "Apache 2.0",
                    "local": True,
                    "vram_gb": 14,
                    "needs_offload": False,
                    "api": "replicate/hunyuan",
                    "api_cost": 0.20,
                    "local_cost": 0.0,
                    "local_time_s": 120,
                    "api_time_s": 15,
                },
                "kling_3": {
                    "name": "Kling 3.0",
                    "license": "Proprietary (API only)",
                    "local": False,
                    "vram_gb": 999,
                    "api": "fal.ai/kling-3",
                    "api_cost": 0.75,
                    "local_cost": 0.0,
                },
                "veo_3": {
                    "name": "Google Veo 3.1",
                    "license": "Proprietary (API only)",
                    "local": False,
                    "vram_gb": 999,
                    "api": "fal.ai/veo-3",
                    "api_cost": 1.00,
                    "local_cost": 0.0,
                },
            },
            "tts": {
                "kokoro": {
                    "name": "Kokoro 82M",
                    "license": "Apache 2.0",
                    "local": True,
                    "vram_gb": 2,
                    "api": None,
                    "local_cost": 0.0,
                    "api_cost": 0.0,
                },
            },
            "lip_sync": {
                "sadtalker": {
                    "name": "SadTalker",
                    "license": "Apache 2.0",
                    "local": True,
                    "vram_gb": 4,
                    "api": None,
                    "local_cost": 0.0,
                    "api_cost": 0.0,
                },
            },
        }

    def route(
        self,
        capability: str,  # "image" | "video" | "tts" | "lip_sync"
        model_id: Optional[str] = None,
        quality: str = "high",  # "high" | "fast"
        prefer_local: bool = True,
        allow_api_fallback: bool = True,
    ) -> RouteDecision:
        """
        Decide where to route a generation request.

        Args:
            capability: What type of generation
            model_id: Specific model to use (None = auto-select)
            quality: "high" = best quality, "fast" = quicker
            prefer_local: Try local first
            allow_api_fallback: Fall back to API if local fails

        Returns:
            RouteDecision with backend, model, cost, time estimates
        """
        available = self.models.get(capability, {})
        if not available:
            return RouteDecision(
                backend="local",
                model_name="none",
                reason=f"Unknown capability: {capability}",
                estimated_cost=0,
                estimated_time_s=0,
            )

        # Auto-select model based on quality preference
        if not model_id:
            if capability == "video":
                if quality == "fast":
                    model_id = "ltx_23"
                else:
                    model_id = "wan_22_a14b"
            elif capability == "image":
                model_id = "flux_klein"
            elif capability == "tts":
                model_id = "kokoro"
            elif capability == "lip_sync":
                model_id = "sadtalker"
            else:
                model_id = list(available.keys())[0]

        model = available.get(model_id)
        if not model:
            return RouteDecision(
                backend="local",
                model_name="none",
                reason=f"Unknown model: {model_id}",
                estimated_cost=0,
                estimated_time_s=0,
            )

        # Try local first if preferred and model supports it
        if prefer_local and model.get("local", False):
            vram_needed = model.get("vram_gb", 0)
            needs_offload = model.get("needs_offload", False)

            if needs_offload:
                # Can we offload to system RAM?
                if self.local_ram >= 64:  # 128GB is plenty
                    return RouteDecision(
                        backend="local",
                        model_name=model["name"],
                        reason=f"Local with CPU offload ({self.local_ram}GB RAM, {vram_needed}GB VRAM)",
                        estimated_cost=model.get("local_cost", 0),
                        estimated_time_s=model.get("local_time_s", 300),
                    )
            elif vram_needed <= self.local_gpu_vram:
                return RouteDecision(
                    backend="local",
                    model_name=model["name"],
                    reason=f"Local (fits in {self.local_gpu_vram}GB VRAM)",
                    estimated_cost=model.get("local_cost", 0),
                    estimated_time_s=model.get("local_time_s", 60),
                )

        # Can't run locally — try API
        if allow_api_fallback and model.get("api") and self.api_enabled:
            api_name = model["api"]
            if "fal.ai" in api_name and self.fal_api_key:
                return RouteDecision(
                    backend="fal_ai",
                    model_name=model["name"],
                    reason=f"fal.ai API ({api_name})",
                    estimated_cost=model.get("api_cost", 0.10),
                    estimated_time_s=model.get("api_time_s", 30),
                )
            elif "replicate" in api_name and self.replicate_api_key:
                return RouteDecision(
                    backend="replicate",
                    model_name=model["name"],
                    reason=f"Replicate API ({api_name})",
                    estimated_cost=model.get("api_cost", 0.20),
                    estimated_time_s=model.get("api_time_s", 30),
                )

        # Cloud GPU fallback
        if self.cloud_gpu_enabled:
            return RouteDecision(
                backend="runpod",
                model_name=model["name"],
                reason="Cloud GPU (RunPod)",
                estimated_cost=model.get("api_cost", 0.30),
                estimated_time_s=model.get("api_time_s", 30),
            )

        # Last resort: try local even if not ideal
        if model.get("local"):
            return RouteDecision(
                backend="local",
                model_name=model["name"],
                reason="Local (may be slow or OOM — no API fallback available)",
                estimated_cost=0,
                estimated_time_s=model.get("local_time_s", 600),
            )

        return RouteDecision(
            backend="local",
            model_name="none",
            reason="No available backend for this model",
            estimated_cost=0,
            estimated_time_s=0,
        )

    def list_available_models(self, capability: Optional[str] = None) -> dict:
        """List all available models, optionally filtered by capability."""
        if capability:
            return {capability: self.models.get(capability, {})}
        return self.models

    def status(self) -> dict:
        """Get router status for the API."""
        return {
            "local_available": self.local_available,
            "local_gpu_vram": self.local_gpu_vram,
            "local_ram": self.local_ram,
            "api_enabled": self.api_enabled,
            "cloud_gpu_enabled": self.cloud_gpu_enabled,
            "fal_ai_configured": bool(self.fal_api_key),
            "replicate_configured": bool(self.replicate_api_key),
            "models": {
                cap: {
                    mid: {
                        "name": m["name"],
                        "license": m["license"],
                        "local": m.get("local", False),
                        "api": m.get("api"),
                        "cost": m.get("local_cost", 0) if m.get("local") else m.get("api_cost", 0),
                    }
                    for mid, m in models.items()
                }
                for cap, models in self.models.items()
            },
        }
