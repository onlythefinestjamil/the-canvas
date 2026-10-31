"""
Image Engine — generates still images using FLUX (local) or fal.ai (API).

Local: FLUX.2 Klein (Apache 2.0) via diffusers with DirectML (AMD) or MPS (Mac)
API:   fal.ai FLUX endpoint (optional fallback)
"""
import os
import time
from typing import Optional
from rich.console import Console

console = Console()


class ImageEngine:
    """Generates images from text prompts."""

    def __init__(self, config, credit_tracker):
        self.config = config
        self.credits = credit_tracker
        self._pipe = None  # Lazy-loaded diffusers pipeline
        self._device = None

    def _get_device(self):
        """Detect and return the appropriate torch device."""
        import torch

        try:
            import torch_directml
            dev = torch_directml.device()
            console.print(f"[green]Using DirectML device: {dev}[/green]")
            return dev, "directml"
        except ImportError:
            pass

        if torch.backends.mps.is_available():
            console.print("[green]Using Apple Metal (MPS)[/green]")
            return torch.device("mps"), "mps"

        if torch.cuda.is_available():
            console.print("[green]Using CUDA[/green]")
            return torch.device("cuda"), "cuda"

        console.print("[yellow]Using CPU (slow)[/yellow]")
        return torch.device("cpu"), "cpu"

    def _load_pipeline(self):
        """Lazy-load the FLUX diffusers pipeline."""
        if self._pipe is not None:
            return

        import torch
        from diffusers import FluxPipeline

        device, device_type = self._get_device()
        self._device = device_type

        model_cfg = self.config.models.get("image", {})
        repo_id = model_cfg.get("repo_id", "black-forest-labs/FLUX.2-Klein-4B")
        local_path = self.config.model_path(repo_id)

        console.print(f"[cyan]Loading FLUX model from {local_path}...[/cyan]")

        if os.path.exists(local_path):
            self._pipe = FluxPipeline.from_pretrained(
                local_path,
                torch_dtype=torch.bfloat16,
            )
        else:
            console.print(f"[yellow]Local model not found at {local_path}, downloading from HuggingFace...[/yellow]")
            self._pipe = FluxPipeline.from_pretrained(
                repo_id,
                torch_dtype=torch.bfloat16,
                cache_dir=self.config.model_dir,
            )

        self._pipe = self._pipe.to(device)
        console.print("[green]FLUX model loaded.[/green]")

    def generate(
        self,
        prompt: str,
        output_path: str,
        width: int = 1024,
        height: int = 1024,
        num_inference_steps: int = 4,
        seed: Optional[int] = None,
    ) -> str:
        """
        Generate an image from a text prompt.

        Args:
            prompt: Text description of the image
            output_path: Where to save the image
            width/height: Image dimensions
            num_inference_steps: More = higher quality, slower
            seed: Reproducibility seed

        Returns:
            Path to the saved image
        """
        start = time.time()

        # Try local generation first
        try:
            self._load_pipeline()
            import torch

            generator = None
            if seed is not None:
                generator = torch.Generator(device="cpu").manual_seed(seed)

            console.print(f"[cyan]Generating image: {prompt[:80]}...[/cyan]")
            result = self._pipe(
                prompt=prompt,
                width=width,
                height=height,
                num_inference_steps=num_inference_steps,
                generator=generator,
            )
            image = result.images[0]
            image.save(output_path)

            elapsed = time.time() - start
            self.credits.log(
                capability="image",
                model_name="FLUX.2 Klein",
                backend="local",
                cost=0.0,
                prompt=prompt,
                output_path=output_path,
                duration_s=elapsed,
            )
            console.print(f"[green]✓ Image saved: {output_path} ({elapsed:.1f}s)[/green]")
            return output_path

        except Exception as e:
            console.print(f"[red]Local image generation failed: {e}[/red]")

            # Try API fallback if enabled
            if self.config.api.get("enabled") and self.config.api.get("fal_ai", {}).get("api_key"):
                return self._generate_api(prompt, output_path, width, height)
            else:
                raise

    def _generate_api(self, prompt: str, output_path: str, width: int, height: int) -> str:
        """Fallback: generate via fal.ai API."""
        import requests

        api_key = self.config.api["fal_ai"]["api_key"]
        headers = {"Authorization": f"Key {api_key}", "Content-Type": "application/json"}

        payload = {
            "prompt": prompt,
            "image_size": {"width": width, "height": height},
            "num_images": 1,
        }

        console.print(f"[cyan]Generating via fal.ai API...[/cyan]")
        start = time.time()
        response = requests.post(
            "https://fal.run/fal-ai/flux/schnell",
            headers=headers,
            json=payload,
            timeout=120,
        )
        response.raise_for_status()
        data = response.json()

        image_url = data["images"][0]["url"]
        img_response = requests.get(image_url, timeout=60)
        with open(output_path, "wb") as f:
            f.write(img_response.content)

        elapsed = time.time() - start
        cost = self.config.credits.get("costs", {}).get("api_fal_image", 0.01)
        self.credits.log(
            capability="image",
            model_name="FLUX (fal.ai)",
            backend="fal.ai",
            cost=cost,
            prompt=prompt,
            output_path=output_path,
            duration_s=elapsed,
        )
        console.print(f"[green]✓ Image saved via API: {output_path} ({elapsed:.1f}s, ${cost})[/green]")
        return output_path
