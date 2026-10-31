"""
Credit Tracker — logs the cost of every generation.
Local models are free ($0.00). API fallbacks cost money.
"""
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Optional


class CreditTracker:
    """Tracks generation costs across all Canvas runs."""

    def __init__(self, log_path: str = "H:/canvas-outputs/credits.json"):
        self.log_path = Path(log_path)
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        self.entries = self._load()

    def _load(self) -> list:
        if self.log_path.exists():
            with open(self.log_path, "r") as f:
                return json.load(f)
        return []

    def _save(self):
        with open(self.log_path, "w") as f:
            json.dump(self.entries, f, indent=2)

    def log(
        self,
        capability: str,       # "image" | "video" | "tts" | "lip_sync" | "composite"
        model_name: str,
        backend: str,          # "local" | "fal.ai" | "replicate"
        cost: float,
        prompt: str = "",
        output_path: str = "",
        duration_s: float = 0.0,
        metadata: Optional[dict] = None,
    ):
        """Log a generation event."""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "capability": capability,
            "model": model_name,
            "backend": backend,
            "cost_usd": cost,
            "prompt": prompt[:500],  # Truncate long prompts
            "output": output_path,
            "duration_seconds": duration_s,
            "metadata": metadata or {},
        }
        self.entries.append(entry)
        self._save()
        return entry

    def total_cost(self) -> float:
        """Total USD spent across all generations."""
        return sum(e["cost_usd"] for e in self.entries)

    def total_local(self) -> int:
        """Count of local (free) generations."""
        return sum(1 for e in self.entries if e["backend"] == "local")

    def total_api(self) -> int:
        """Count of API (paid) generations."""
        return sum(1 for e in self.entries if e["backend"] != "local")

    def summary(self) -> str:
        """Human-readable summary."""
        total = len(self.entries)
        cost = self.total_cost()
        local = self.total_local()
        api = self.total_api()
        return (
            f"The Canvas — Generation Summary\n"
            f"  Total generations: {total}\n"
            f"  Local (free): {local}\n"
            f"  API (paid): {api}\n"
            f"  Total cost: ${cost:.2f}\n"
        )
