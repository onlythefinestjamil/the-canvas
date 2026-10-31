"""
Video Engine — generates video clips using Wan 2.2 (local) or fal.ai (API).

Local: Wan 2.2 T2V-A14B (Apache 2.0) with CPU offloading via 128GB RAM
       Also supports LTX-2.3 (Apache 2.0) for faster, lower-VRAM generation
API:   fal.ai Wan 2.2 endpoint (optional fallback for speed)
"""
import os
import time
import subprocess
from typing import Optional
from rich.console import Console

console = Console()


class VideoEngine:
    """Generates video clips from text prompts or images."""

    def __init__(self, config, credit_tracker):
        self.config = config
        self.credits = credit_tracker
        self._pipe = None
        self._device = None
        self._model_type = None  # "wan" | "ltx"

    def _get_device(self):
        """Detect torch device."""
        import torch

        try:
            import torch_directml
            dev = torch_directml.device()
            return dev, "directml"
        except ImportError:
            pass

        if torch.backends.mps.is_available():
            return torch.device("mps"), "mps"

        if torch.cuda.is_available():
            return torch.device("cuda"), "cuda"

        return torch.device("cpu"), "cpu"

    def _load_wan(self):
        """Load Wan 2.2 pipeline with CPU offloading."""
        if self._pipe is not None and self._model_type == "wan":
            return

        import torch
        from diffusers import AutoPipelineForText2Video

        device, device_type = self._get_device()
        self._device = device_type

        model_cfg = self.config.models.get("video", {}).get("primary", {})
        repo_id = model_cfg.get("repo_id", "Wan-AI/Wan2.2-T2V-A14B")
        local_path = self.config.model_path(repo_id)
        offload = model_cfg.get("offload_model", True)

        console.print(f"[cyan]Loading Wan 2.2 from {local_path}...[/cyan]")
        console.print(f"[cyan]  CPU offload: {offload} (uses 128GB system RAM)[/cyan]")

        if os.path.exists(local_path):
            self._pipe = AutoPipelineForText2Video.from_pretrained(
                local_path,
                torch_dtype=torch.bfloat16,
            )
        else:
            console.print(f"[yellow]Downloading Wan 2.2 from HuggingFace...[/yellow]")
            self._pipe = AutoPipelineForText2Video.from_pretrained(
                repo_id,
                torch_dtype=torch.bfloat16,
                cache_dir=self.config.model_dir,
            )

        if offload:
            # Offload to CPU — slower but fits in 16GB VRAM with 128GB RAM overflow
            self._pipe.enable_model_cpu_offload()
        else:
            self._pipe = self._pipe.to(device)

        self._model_type = "wan"
        console.print("[green]Wan 2.2 loaded.[/green]")

    def _load_ltx(self):
        """Load LTX-2.3 pipeline (faster, lower VRAM)."""
        if self._pipe is not None and self._model_type == "ltx":
            return

        import torch
        from diffusers import AutoPipelineForText2Video

        device, device_type = self._get_device()
        self._device = device_type

        model_cfg = self.config.models.get("video", {}).get("fast", {})
        repo_id = model_cfg.get("repo_id", "Lightricks/LTX-2.3")
        local_path = self.config.model_path(repo_id)

        console.print(f"[cyan]Loading LTX-2.3 from {local_path}...[/cyan]")

        if os.path.exists(local_path):
            self._pipe = AutoPipelineForText2Video.from_pretrained(
                local_path,
                torch_dtype=torch.bfloat16,
            )
        else:
            self._pipe = AutoPipelineForText2Video.from_pretrained(
                repo_id,
                torch_dtype=torch.bfloat16,
                cache_dir=self.config.model_dir,
            )

        self._pipe = self._pipe.to(device)
        self._model_type = "ltx"
        console.print("[green]LTX-2.3 loaded.[/green]")

    def generate(
        self,
        prompt: str,
        output_path: str,
        duration_s: float = 5.0,
        width: int = 1280,
        height: int = 720,
        num_frames: int = 81,
        num_inference_steps: int = 30,
        seed: Optional[int] = None,
        image_path: Optional[str] = None,
        quality: str = "high",  # "high" (Wan) | "fast" (LTX)
        fallback_to_api: bool = True,
    ) -> str:
        """
        Generate a video clip from a text prompt (and optional image).

        Args:
            prompt: Text description of the video
            output_path: Where to save the video (.mp4)
            duration_s: Target duration in seconds
            width/height: Video resolution
            num_frames: Total frames (duration_s * fps)
            num_inference_steps: Quality vs speed tradeoff
            seed: Reproducibility
            image_path: Optional reference image for I2V
            quality: "high" uses Wan 2.2, "fast" uses LTX-2.3
            fallback_to_api: If True and local fails, try fal.ai

        Returns:
            Path to the saved video
        """
        start = time.time()

        try:
            if quality == "high":
                self._load_wan()
            else:
                self._load_ltx()

            import torch

            generator = None
            if seed is not None:
                generator = torch.Generator(device="cpu").manual_seed(seed)

            # Calculate frames from duration
            fps = 24
            if num_frames is None:
                num_frames = int(duration_s * fps)

            console.print(f"[cyan]Generating video: {prompt[:60]}...[/cyan]")
            console.print(f"[cyan]  {width}x{height}, {num_frames} frames, {quality} quality[/cyan]")

            # Build kwargs
            kwargs = dict(
                prompt=prompt,
                width=width,
                height=height,
                num_frames=num_frames,
                num_inference_steps=num_inference_steps,
                generator=generator,
            )

            if image_path and os.path.exists(image_path):
                kwargs["image"] = image_path

            result = self._pipe(**kwargs)
            video = result.frames[0]

            # Save as MP4
            self._save_video(video, output_path, fps)

            elapsed = time.time() - start
            model_name = "Wan 2.2 A14B" if quality == "high" else "LTX-2.3"
            self.credits.log(
                capability="video",
                model_name=model_name,
                backend="local",
                cost=0.0,
                prompt=prompt,
                output_path=output_path,
                duration_s=elapsed,
                metadata={"quality": quality, "frames": num_frames, "resolution": f"{width}x{height}"},
            )
            console.print(f"[green]✓ Video saved: {output_path} ({elapsed:.1f}s)[/green]")
            return output_path

        except Exception as e:
            console.print(f"[red]Local video generation failed: {e}[/red]")

            if fallback_to_api and self.config.api.get("enabled"):
                return self._generate_api(prompt, output_path, width, height, duration_s)

            raise

    def _save_video(self, frames, output_path: str, fps: int = 24):
        """Save video frames to MP4 using imageio or FFmpeg."""
        try:
            import imageio
            import numpy as np

            frames_np = [np.array(frame) for frame in frames]
            writer = imageio.get_writer(
                output_path,
                fps=fps,
                codec="libx264",
                quality=8,
                macro_block_size=16,
            )
            for frame in frames_np:
                writer.append_data(frame)
            writer.close()
        except ImportError:
            # Fallback: export frames as PNGs and use FFmpeg
            temp_dir = output_path.replace(".mp4", "_frames")
            os.makedirs(temp_dir, exist_ok=True)
            for i, frame in enumerate(frames):
                frame.save(os.path.join(temp_dir, f"frame_{i:05d}.png"))

            ffmpeg = self.config.compositor.get("ffmpeg_path", "ffmpeg")
            subprocess.run(
                [
                    ffmpeg, "-y",
                    "-framerate", str(fps),
                    "-i", os.path.join(temp_dir, "frame_%05d.png"),
                    "-c:v", "libx264",
                    "-pix_fmt", "yuv420p",
                    output_path,
                ],
                check=True,
            )

    def _generate_api(self, prompt: str, output_path: str, width: int, height: int, duration_s: float) -> str:
        """Fallback: generate via fal.ai API."""
        import requests

        api_key = self.config.api["fal_ai"]["api_key"]
        headers = {"Authorization": f"Key {api_key}", "Content-Type": "application/json"}

        payload = {
            "prompt": prompt,
            "duration": str(int(duration_s)) + "s",
            "aspect_ratio": f"{width}:{height}",
        }

        console.print(f"[cyan]Generating via fal.ai API (Wan 2.2)...[/cyan]")
        start = time.time()
        response = requests.post(
            "https://fal.run/fal-ai/wan-video/text-to-video",
            headers=headers,
            json=payload,
            timeout=300,
        )
        response.raise_for_status()
        data = response.json()

        video_url = data["video"]["url"]
        vid_response = requests.get(video_url, timeout=120)
        with open(output_path, "wb") as f:
            f.write(vid_response.content)

        elapsed = time.time() - start
        cost = self.config.credits.get("costs", {}).get("api_fal_video", 0.50)
        self.credits.log(
            capability="video",
            model_name="Wan 2.2 (fal.ai)",
            backend="fal.ai",
            cost=cost,
            prompt=prompt,
            output_path=output_path,
            duration_s=elapsed,
        )
        console.print(f"[green]✓ Video saved via API: {output_path} ({elapsed:.1f}s, ${cost})[/green]")
        return output_path
