"""
Pipeline — orchestrates the full The Canvas generation flow.

Prompt → Plan → Image/Video per shot → Voiceover → Audio mix → Composite → Export
"""
import os
import time
from pathlib import Path
from typing import Optional
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn

from .config import CanvasConfig
from .credit_tracker import CreditTracker
from .prompt_parser import parse_prompt, plan_to_text, ProductionPlan
from .image_engine import ImageEngine
from .video_engine import VideoEngine
from .audio_engine import AudioEngine
from .compositor import Compositor

console = Console()


class CanvasPipeline:
    """The main pipeline that ties everything together."""

    def __init__(self, config_path: str = "config.yaml"):
        self.config = CanvasConfig.load(config_path)
        self.config.ensure_dirs()

        self.credits = CreditTracker(
            self.config.credits.get("log_file", "credits.json")
        )
        self.image_engine = ImageEngine(self.config, self.credits)
        self.video_engine = VideoEngine(self.config, self.credits)
        self.audio_engine = AudioEngine(self.config, self.credits)
        self.compositor = Compositor(self.config)

    def create(
        self,
        description: str,
        output_path: Optional[str] = None,
        quality: str = "high",
        voice: str = "af_heart",
        include_voiceover: bool = True,
        caption_style: Optional[str] = None,
    ) -> str:
        """
        Create a complete video from a text description.

        This is the main entry point. Give it a description, get back a video.

        Args:
            description: What you want to create (natural language)
            output_path: Where to save the final video (defaults to output_dir)
            quality: "high" (Wan 2.2) | "fast" (LTX-2.3)
            voice: Kokoro voice ID for voiceover
            include_voiceover: Whether to generate narration
            caption_style: Burn captions ("bold" | "hud" | "clean" | None)

        Returns:
            Path to the final exported video
        """
        total_start = time.time()
        console.print("\n[bold cyan]═══ The Canvas ═══[/bold cyan]\n")

        # ── 1. Parse prompt into production plan ──
        plan = parse_prompt(description, self.config)
        console.print(plan_to_text(plan))

        # Determine output path
        if not output_path:
            safe_title = plan.title.replace(" ", "_").replace("/", "-")[:40]
            output_path = os.path.join(
                self.config.output_dir, f"{safe_title}.mp4"
            )

        # Set up working directory for this project
        project_dir = os.path.join(self.config.temp_dir, safe_title)
        os.makedirs(project_dir, exist_ok=True)

        # ── 2. Generate visual assets (images + videos) ──
        console.print("\n[bold]Phase 1: Generating Visuals[/bold]")
        video_clips = []

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TextColumn("{task.completed}/{task.total}"),
            console=console,
        ) as progress:
            task = progress.add_task("Generating shots...", total=len(plan.shots))

            for shot in plan.shots:
                clip_path = os.path.join(project_dir, f"shot_{shot.id:03d}.mp4")

                if shot.needs_video:
                    # Generate video clip
                    progress.update(task, description=f"Shot {shot.id}: video — {shot.description[:40]}...")
                    try:
                        self.video_engine.generate(
                            prompt=shot.visual_prompt,
                            output_path=clip_path,
                            duration_s=shot.duration_s,
                            quality=quality,
                            fallback_to_api=True,
                        )
                    except Exception as e:
                        console.print(f"[yellow]Video gen failed for shot {shot.id}, falling back to image→video: {e}[/yellow]")
                        img_path = os.path.join(project_dir, f"shot_{shot.id:03d}.png")
                        self.image_engine.generate(
                            prompt=shot.visual_prompt,
                            output_path=img_path,
                        )
                        self.compositor.image_to_video(
                            img_path, clip_path, duration_s=shot.duration_s
                        )
                else:
                    # Generate still image → convert to video clip
                    progress.update(task, description=f"Shot {shot.id}: image — {shot.description[:40]}...")
                    img_path = os.path.join(project_dir, f"shot_{shot.id:03d}.png")
                    self.image_engine.generate(
                        prompt=shot.visual_prompt,
                        output_path=img_path,
                    )
                    self.compositor.image_to_video(
                        img_path, clip_path, duration_s=shot.duration_s
                    )

                video_clips.append(clip_path)
                progress.advance(task)

        # ── 3. Concatenate all clips ──
        console.print("\n[bold]Phase 2: Assembling Timeline[/bold]")
        assembled_path = os.path.join(project_dir, "assembled.mp4")
        self.compositor.concat_videos(video_clips, assembled_path)

        # ── 4. Generate voiceover ──
        audio_tracks = []

        if include_voiceover and plan.voiceover_script:
            console.print("\n[bold]Phase 3: Generating Voiceover[/bold]")
            vo_path = os.path.join(project_dir, "voiceover.wav")
            try:
                self.audio_engine.generate_voiceover(
                    text=plan.voiceover_script,
                    output_path=vo_path,
                    voice=voice,
                )
                audio_tracks.append((vo_path, "voiceover"))
            except Exception as e:
                console.print(f"[yellow]Voiceover generation skipped: {e}[/yellow]")

        # ── 5. Mix audio ──
        if audio_tracks:
            console.print("\n[bold]Phase 4: Mixing Audio[/bold]")
            mixed_path = os.path.join(project_dir, "with_audio.mp4")
            self.compositor.mix_audio(assembled_path, audio_tracks, mixed_path)
            final_before_export = mixed_path
        else:
            final_before_export = assembled_path

        # ── 6. Burn captions (optional) ──
        if caption_style:
            console.print("\n[bold]Phase 5: Burning Captions[/bold]")
            srt_path = self._generate_srt(plan, project_dir)
            captioned_path = os.path.join(project_dir, "captioned.mp4")
            self.compositor.burn_captions(
                final_before_export, srt_path, captioned_path, caption_style
            )
            final_before_export = captioned_path

        # ── 7. Final export ──
        console.print("\n[bold]Phase 6: Final Export[/bold]")
        self.compositor.export_final(
            final_before_export, output_path, quality="high"
        )

        # ── Done ──
        total_elapsed = time.time() - total_start
        console.print(f"\n[bold green]✓ The Canvas — Complete![/bold green]")
        console.print(f"[green]  Output: {output_path}[/green]")
        console.print(f"[green]  Time: {total_elapsed:.1f}s[/green]")
        console.print(f"\n{self.credits.summary()}")

        return output_path

    def _generate_srt(self, plan: ProductionPlan, project_dir: str) -> str:
        """Generate a simple .srt subtitle file from the plan."""
        srt_path = os.path.join(project_dir, "captions.srt")
        current_time = 0.0

        with open(srt_path, "w") as f:
            for i, shot in enumerate(plan.shots):
                start_s = current_time
                end_s = current_time + shot.duration_s

                # Format as SRT timestamp
                def fmt(s):
                    h = int(s // 3600)
                    m = int((s % 3600) // 60)
                    sec = int(s % 60)
                    ms = int((s % 1) * 1000)
                    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"

                f.write(f"{i + 1}\n")
                f.write(f"{fmt(start_s)} --> {fmt(end_s)}\n")
                f.write(f"{shot.description}\n\n")

                current_time = end_s

        return srt_path
