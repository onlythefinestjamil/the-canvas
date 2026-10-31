#!/usr/bin/env python3
"""
The Canvas — AI Creative Generation Pipeline
=============================================
Self-hosted alternative to ElevenLabs Creative Studio.

Usage:
    python main.py "Create a 30-second promo for a junk hauling business"
    python main.py "Vertical 15s TikTok ad for a fitness app" --quality fast
    python main.py "Cinematic 45s product showcase" --voice af_heart --captions hud

All models run locally (Apache 2.0 / MIT). No API keys required.
Optional fal.ai fallback if local models OOM.
"""
import sys
import os

import click
from rich.console import Console
from rich.panel import Panel

console = Console()


@click.command()
@click.argument("description")
@click.option("--output", "-o", default=None, help="Output file path")
@click.option("--quality", "-q", type=click.Choice(["high", "fast"]), default="high",
              help="high=Wan 2.2 (best quality), fast=LTX-2.3 (faster)")
@click.option("--voice", "-v", default="af_heart", help="Kokoro voice ID")
@click.option("--no-voiceover", is_flag=True, help="Skip voiceover generation")
@click.option("--captions", "-c", type=click.Choice(["bold", "hud", "clean"]), default=None,
              help="Burn captions in this style")
@click.option("--config", "config_path", default="config.yaml", help="Config file path")
@click.option("--credits", is_flag=True, help="Show credit/generation summary and exit")
def main(description, output, quality, voice, no_voiceover, captions, config_path, credits):
    """The Canvas — create industry-quality video from a text description."""

    if credits:
        from the_canvas.credit_tracker import CreditTracker
        tracker = CreditTracker("credits.json")
        console.print(tracker.summary())
        return

    # Show banner
    console.print(Panel.fit(
        "[bold cyan]The Canvas[/bold cyan]\n"
        "[dim]AI Creative Generation Pipeline — Self-Hosted[/dim]",
        border_style="cyan",
    ))

    from the_canvas.pipeline import CanvasPipeline

    pipeline = CanvasPipeline(config_path)

    try:
        result = pipeline.create(
            description=description,
            output_path=output,
            quality=quality,
            voice=voice,
            include_voiceover=not no_voiceover,
            caption_style=captions,
        )
        console.print(f"\n[bold green]Done! → {result}[/bold green]")
    except KeyboardInterrupt:
        console.print("\n[yellow]Cancelled by user.[/yellow]")
        sys.exit(1)
    except Exception as e:
        console.print(f"\n[red]Error: {e}[/red]")
        console.print("[dim]Check that models are downloaded and config.yaml paths are correct.[/dim]")
        sys.exit(1)


if __name__ == "__main__":
    main()
