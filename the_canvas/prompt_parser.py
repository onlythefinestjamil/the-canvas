"""
Prompt Parser — converts a natural language description into a structured
production plan (script, shot list, asset list).

Uses the LLM (via Hermes or OpenAI API) to break down the request.
Falls back to a simple template parser if no LLM is available.
"""
import json
from dataclasses import dataclass, field
from typing import Optional, List
from rich.console import Console

console = Console()


@dataclass
class Shot:
    """A single shot in the production plan."""
    id: int
    description: str           # What happens in this shot
    duration_s: float           # Target length in seconds
    visual_prompt: str         # Prompt for image/video generation
    needs_video: bool = False  # True = generate video, False = generate still image
    voiceover_text: str = ""   # Narration for this shot (if any)
    sfx_description: str = ""  # Sound effect description (if any)


@dataclass
class ProductionPlan:
    """Structured plan for a Canvas generation."""
    title: str
    description: str
    total_duration_s: float
    aspect_ratio: str           # "16:9" | "9:16" | "1:1"
    resolution: str            # "1920x1080" | "1080x1920" etc
    content_type: str = "general"  # "movie" | "anime" | "game" | "ad" | etc
    shots: List[Shot] = field(default_factory=list)
    voiceover_script: str = "" # Full narration script
    music_description: str = ""


def parse_prompt(description: str, config=None) -> ProductionPlan:
    """
    Convert a natural language description into a ProductionPlan.

    This is the brain of The Canvas — it figures out what to generate
    and in what order. Uses an LLM if available, otherwise falls back
    to a simple heuristic parser.
    """
    description = description.strip()

    # Try LLM-based parsing (if OpenAI API key is configured)
    # For now, use the heuristic parser — Melene can add LLM parsing later
    return _heuristic_parse(description)


def _heuristic_parse(description: str) -> ProductionPlan:
    """
    Simple heuristic parser — breaks the description into shots based on
    natural sentence boundaries and keywords.
    """
    import re

    desc_lower = description.lower()

    # Detect content type for presets
    content_type = "general"
    content_keywords = {
        "movie": ["movie", "film", "feature", "short film", "cinematic"],
        "animation": ["animation", "animated", "cartoon", "2d animation", "3d animation"],
        "anime": ["anime", "manga style", "cel shaded"],
        "music_video": ["music video", "music promo", "visualizer", "lyric video"],
        "game": ["video game", "gameplay", "game trailer", "gaming", "game cinematic", "esports", "let's play"],
        "ad": ["ad", "commercial", "promo", "advertisement", "spot"],
        "product": ["product", "showcase", "demo", "unboxing"],
        "clothing": ["clothing", "fashion", "streetwear", "apparel", "brand"],
        "food": ["food", "restaurant", "menu", "cuisine"],
        "real_estate": ["real estate", "property", "listing", "home tour"],
    }
    for ctype, keywords in content_keywords.items():
        if any(w in desc_lower for w in keywords):
            content_type = ctype
            break

    # Content type presets
    content_presets = {
        "movie": {"default_shots": 8, "default_duration": 120, "voiceover_style": "cinematic"},
        "animation": {"default_shots": 6, "default_duration": 60, "voiceover_style": "narrator"},
        "anime": {"default_shots": 6, "default_duration": 90, "voiceover_style": "dramatic"},
        "game": {"default_shots": 8, "default_duration": 60, "voiceover_style": "hype"},
        "music_video": {"default_shots": 8, "default_duration": 180, "voiceover_style": None},
        "ad": {"default_shots": 4, "default_duration": 30, "voiceover_style": "professional"},
        "product": {"default_shots": 4, "default_duration": 30, "voiceover_style": "professional"},
        "clothing": {"default_shots": 5, "default_duration": 30, "voiceover_style": "trendy"},
        "food": {"default_shots": 4, "default_duration": 30, "voiceover_style": "appetizing"},
        "real_estate": {"default_shots": 6, "default_duration": 60, "voiceover_style": "luxury"},
    }

    # Detect vertical/social formats first
    aspect = "16:9"
    resolution = "1920x1080"
    if any(w in desc_lower for w in ["vertical", "9:16", "portrait", "tiktok", "reels", "shorts", "story"]):
        aspect = "9:16"
        resolution = "1080x1920"
    elif any(w in desc_lower for w in ["square", "1:1", "instagram post", "feed post"]):
        aspect = "1:1"
        resolution = "1080x1080"
    elif any(w in desc_lower for w in ["cinematic", "widescreen", "youtube", "16:9"]):
        aspect = "16:9"
        resolution = "1920x1080"

    # Detect duration
    duration = 30.0  # Default 30 seconds
    # Match patterns like "15-second", "30 sec", "45s", "2 minute", "90 second"
    dur_match = re.search(r'(\d+)\s*[-]?\s*(?:second|sec|s)\b', desc_lower)
    if dur_match:
        duration = float(dur_match.group(1))
    else:
        dur_match = re.search(r'(\d+)\s*[-]?\s*(?:minute|min)\b', desc_lower)
        if dur_match:
            duration = float(dur_match.group(1)) * 60
        else:
            # Match bare numbers followed by 's' at word boundary
            dur_match = re.search(r'\b(\d+)\s*s\b', desc_lower)
            if dur_match and int(dur_match.group(1)) > 3:
                duration = float(dur_match.group(1))

    # Split description into shots by sentences
    sentences = re.split(r'[.!?]+', description)
    sentences = [s.strip() for s in sentences if s.strip() and len(s.strip()) > 10]

    if not sentences:
        sentences = [description]

    # Distribute duration across shots
    shot_count = len(sentences)
    shot_duration = max(3.0, duration / shot_count)

    shots = []
    for i, sentence in enumerate(sentences):
        # Determine if this should be video or still
        needs_video = any(
            w in sentence.lower()
            for w in ["video", "clip", "animate", "motion", "move", "scene", "sequence", "b-roll", "broll"]
        )

        shots.append(
            Shot(
                id=i + 1,
                description=sentence,
                duration_s=shot_duration,
                visual_prompt=sentence,
                needs_video=needs_video,
                voiceover_text=sentence if i == 0 else "",  # Narrate first shot
            )
        )

    return ProductionPlan(
        title=description[:60],
        description=description,
        total_duration_s=duration,
        aspect_ratio=aspect,
        resolution=resolution,
        content_type=content_type,
        shots=shots,
        voiceover_script=description,
    )


def plan_to_text(plan: ProductionPlan) -> str:
    """Pretty-print a production plan for the console."""
    lines = [
        f"\n[bold cyan]The Canvas — Production Plan[/bold cyan]",
        f"  Type: {plan.content_type}",
        f"  Title: {plan.title}",
        f"  Duration: {plan.total_duration_s}s",
        f"  Aspect: {plan.aspect_ratio} ({plan.resolution})",
        f"  Shots: {len(plan.shots)}",
        "",
    ]
    for shot in plan.shots:
        media = "[yellow]video[/yellow]" if shot.needs_video else "[blue]image[/blue]"
        lines.append(f"  Shot {shot.id}: {media} — {shot.duration_s:.1f}s — {shot.description[:80]}")
    lines.append("")
    return "\n".join(lines)
