"""
Audio Engine — generates voiceovers using Kokoro TTS (local, Apache 2.0).

Kokoro is the best quality/size ratio open TTS model (~2GB).
Falls back to OpenAI TTS API if configured.
"""
import os
import time
from typing import Optional
from rich.console import Console

console = Console()


class AudioEngine:
    """Generates voiceover audio from text."""

    def __init__(self, config, credit_tracker):
        self.config = config
        self.credits = credit_tracker
        self._model = None

    def _load_model(self):
        """Lazy-load Kokoro TTS."""
        if self._model is not None:
            return

        model_cfg = self.config.models.get("tts", {})
        repo_id = model_cfg.get("repo_id", "hexgrad/Kokoro-82M")
        local_path = self.config.model_path(repo_id)

        console.print(f"[cyan]Loading Kokoro TTS...[/cyan]")

        # Kokoro uses its own loading mechanism
        # pip install kokoro
        try:
            from kokoro import KPipeline
            self._model = KPipeline(repo_or_local=local_path if os.path.exists(local_path) else repo_id)
        except ImportError:
            # Fallback: try transformers-based TTS
            console.print("[yellow]Kokoro not installed. Trying transformers TTS...[/yellow]")
            import torch
            from transformers import AutoModelForCausalLM, AutoTokenizer

            # Use a simple TTS from transformers as fallback
            self._model = {"type": "transformers", "repo": repo_id}

    def generate_voiceover(
        self,
        text: str,
        output_path: str,
        voice: str = "af_heart",  # Kokoro voice name
        speed: float = 1.0,
    ) -> str:
        """
        Generate a voiceover audio file from text.

        Args:
            text: The script text to narrate
            output_path: Where to save the audio (.wav)
            voice: Kokoro voice ID
            speed: Speech speed multiplier

        Returns:
            Path to the saved audio file
        """
        start = time.time()

        try:
            self._load_model()

            if isinstance(self._model, dict) and self._model.get("type") == "transformers":
                raise RuntimeError("Kokoro not available, trying API fallback")

            # Kokoro pipeline
            from kokoro import KPipeline
            pipeline = self._model

            import soundfile as sf
            import torch

            # Generate audio
            audio_data = []
            for _, _, audio in pipeline(text, voice=voice, speed=speed):
                audio_data.append(audio)

            import numpy as np
            full_audio = np.concatenate(audio_data)
            sf.write(output_path, full_audio, 24000)

            elapsed = time.time() - start
            self.credits.log(
                capability="tts",
                model_name="Kokoro",
                backend="local",
                cost=0.0,
                prompt=text[:200],
                output_path=output_path,
                duration_s=elapsed,
            )
            console.print(f"[green]✓ Voiceover saved: {output_path} ({elapsed:.1f}s)[/green]")
            return output_path

        except Exception as e:
            console.print(f"[red]Kokoro TTS failed: {e}[/red]")

            # Try OpenAI TTS API if configured
            if self.config.api.get("enabled") and os.environ.get("OPENAI_API_KEY"):
                return self._generate_openai_tts(text, output_path, voice, speed)

            raise

    def _generate_openai_tts(self, text: str, output_path: str, voice: str, speed: float) -> str:
        """Fallback: OpenAI TTS API."""
        from openai import OpenAI
        import requests

        client = OpenAI()
        start = time.time()

        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=text,
            speed=speed,
        )
        response.stream_to_file(output_path)

        elapsed = time.time() - start
        cost = 0.015 * (len(text) / 1000)  # ~$0.015 per 1K chars
        self.credits.log(
            capability="tts",
            model_name="OpenAI TTS",
            backend="openai",
            cost=cost,
            prompt=text[:200],
            output_path=output_path,
            duration_s=elapsed,
        )
        console.print(f"[green]✓ Voiceover saved via OpenAI: {output_path} (${cost:.4f})[/green]")
        return output_path
