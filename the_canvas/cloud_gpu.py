"""
Cloud GPU Client — routes generation to RunPod/Vast.ai when local GPU is busy
or when the user doesn't have a capable GPU.

RunPod: https://api.runpod.io
Vast.ai: https://vast.ai

Melene sets up the API keys in config.yaml; this code handles the rest.
"""
import os
import time
import requests
from typing import Optional
from rich.console import Console

console = Console()


class CloudGPUClient:
    """Client for routing generation to cloud GPUs."""

    def __init__(self, config):
        self.config = config
        cloud = config.api.get("cloud_gpu", {})
        self.enabled = cloud.get("enabled", False)
        self.provider = cloud.get("provider", "runpod")  # "runpod" | "vast"
        self.api_key = cloud.get("api_key", "")
        self.endpoint_id = cloud.get("endpoint_id", "")  # RunPod serverless endpoint

    def generate_video(
        self,
        prompt: str,
        output_path: str,
        model: str = "wan_2.2",
        duration_s: float = 5.0,
        width: int = 1280,
        height: int = 720,
    ) -> str:
        """Generate video on cloud GPU."""
        if not self.enabled or not self.api_key:
            raise RuntimeError("Cloud GPU not configured")

        if self.provider == "runpod":
            return self._runpod_generate(prompt, output_path, model, duration_s, width, height)
        elif self.provider == "vast":
            return self._vast_generate(prompt, output_path, model, duration_s, width, height)
        else:
            raise RuntimeError(f"Unknown cloud GPU provider: {self.provider}")

    def _runpod_generate(
        self, prompt: str, output_path: str, model: str, duration_s: float, w: int, h: int
    ) -> str:
        """RunPod serverless endpoint."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "input": {
                "prompt": prompt,
                "model": model,
                "duration": duration_s,
                "width": w,
                "height": h,
            }
        }

        console.print(f"[cyan]Cloud GPU (RunPod): generating {model}...[/cyan]")
        start = time.time()

        # Submit job
        response = requests.post(
            f"https://api.runpod.io/v2/{self.endpoint_id}/run",
            headers=headers,
            json=payload,
            timeout=30,
        )
        response.raise_for_status()
        job = response.json()
        job_id = job["id"]

        # Poll for completion
        while True:
            time.sleep(5)
            status_resp = requests.get(
                f"https://api.runpod.io/v2/{self.endpoint_id}/status/{job_id}",
                headers=headers,
                timeout=10,
            )
            status_resp.raise_for_status()
            status_data = status_resp.json()

            if status_data["status"] == "COMPLETED":
                video_url = status_data["output"].get("video_url")
                if video_url:
                    vid = requests.get(video_url, timeout=120)
                    with open(output_path, "wb") as f:
                        f.write(vid.content)
                elapsed = time.time() - start
                console.print(f"[green]✓ Cloud GPU done ({elapsed:.1f}s)[/green]")
                return output_path

            elif status_data["status"] == "FAILED":
                raise RuntimeError(f"RunPod job failed: {status_data.get('error', 'unknown')}")

    def _vast_generate(
        self, prompt: str, output_path: str, model: str, duration_s: float, w: int, h: int
    ) -> str:
        """Vast.ai — rent a GPU, run the job, download result."""
        # Vast.ai uses a different API — Melene can implement this
        # For now, raise not implemented
        raise NotImplementedError("Vast.ai integration — Melene can implement")
