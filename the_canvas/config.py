"""
Configuration loader — reads config.yaml, resolves paths, validates setup.
"""
import os
import yaml
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ModelConfig:
    name: str
    repo_id: str
    backend: str  # "local" | "api"
    device: str   # "directml" | "mps" | "cuda" | "cpu"
    offload_model: bool = False
    vram_limit_gb: int = 16
    fallback_to_api: bool = False


@dataclass
class CanvasConfig:
    model_dir: str
    output_dir: str
    temp_dir: str
    models: dict = field(default_factory=dict)
    api: dict = field(default_factory=dict)
    credits: dict = field(default_factory=dict)
    compositor: dict = field(default_factory=dict)

    @classmethod
    def load(cls, config_path: str = "config.yaml") -> "CanvasConfig":
        """Load config from YAML file."""
        path = Path(config_path)
        if not path.exists():
            # Try relative to this file
            path = Path(__file__).parent.parent / config_path
        if not path.exists():
            raise FileNotFoundError(f"Config file not found: {config_path}")

        with open(path, "r") as f:
            data = yaml.safe_load(f)

        return cls(
            model_dir=data.get("model_dir", "H:/models"),
            output_dir=data.get("output_dir", "H:/canvas-outputs"),
            temp_dir=data.get("temp_dir", "H:/canvas-temp"),
            models=data.get("models", {}),
            api=data.get("api", {"enabled": False}),
            credits=data.get("credits", {}),
            compositor=data.get("compositor", {}),
        )

    def ensure_dirs(self):
        """Create output and temp directories if they don't exist."""
        for d in [self.model_dir, self.output_dir, self.temp_dir]:
            Path(d).mkdir(parents=True, exist_ok=True)

    def model_path(self, repo_id: str) -> str:
        """Get local path for a model repo."""
        # Convert HF repo ID to folder name
        folder = repo_id.replace("/", "_")
        return os.path.join(self.model_dir, folder)
