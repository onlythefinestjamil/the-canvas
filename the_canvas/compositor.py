"""
Compositor — assembles generated assets into a final video using FFmpeg.

Handles:
- Multi-track audio mixing (voiceover + music + SFX)
- Video concatenation (stitching clips together)
- Image-to-video (Ken Burns / crossfade for stills)
- Caption/subtitle burning
- Final export (H.264, H.265, ProRes)
"""
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Optional, List
from rich.console import Console

console = Console()


class Compositor:
    """FFmpeg-based timeline compositor."""

    def __init__(self, config):
        self.config = config
        self.ffmpeg = config.compositor.get("ffmpeg_path", "ffmpeg")
        self.ffprobe = self.ffmpeg.replace("ffmpeg", "ffprobe")
        self.default_fps = config.compositor.get("default_fps", 30)
        self.default_resolution = config.compositor.get("default_resolution", "1920x1080")
        self.default_format = config.compositor.get("default_format", "mp4")
        self.default_codec = config.compositor.get("default_codec", "h264")

    def _run_ffmpeg(self, args: List[str], desc: str = ""):
        """Run an FFmpeg command with error handling."""
        cmd = [self.ffmpeg] + args
        console.print(f"[cyan]FFmpeg: {desc}...[/cyan]")
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            console.print(f"[red]FFmpeg error: {result.stderr[-500:]}[/red]")
            raise RuntimeError(f"FFmpeg failed: {result.stderr[-300:]}")
        return result

    def image_to_video(
        self,
        image_path: str,
        output_path: str,
        duration_s: float = 5.0,
        zoom: float = 1.1,  # Ken Burns zoom factor
        fps: int = 30,
    ) -> str:
        """
        Convert a still image to a video clip with Ken Burns effect.

        Args:
            image_path: Source image
            output_path: Output video path (.mp4)
            duration_s: How long to hold the image
            zoom: Zoom factor (1.0 = no zoom, 1.1 = slow zoom in)
            fps: Frame rate

        Returns:
            Path to the generated video
        """
        # Ken Burns: pan and zoom
        # zoompan filter: z='min(zoom+0.0015,1.1)' for gradual zoom
        w, h = self.default_resolution.split("x")

        self._run_ffmpeg(
            [
                "-y", "-loop", "1", "-i", image_path,
                "-vf", f"scale={w}:{h}:force_original_aspect_ratio=increase,"
                       f"crop={w}:{h},"
                       f"zoompan=z='min(zoom+0.0015,{zoom})':d={int(duration_s*fps)}:s={w}x{h}:fps={fps}",
                "-t", str(duration_s),
                "-c:v", "libx264", "-pix_fmt", "yuv420p",
                "-r", str(fps),
                output_path,
            ],
            desc=f"Image→video ({os.path.basename(image_path)}, {duration_s}s)",
        )
        console.print(f"[green]✓ Image→video: {output_path}[/green]")
        return output_path

    def concat_videos(self, video_paths: List[str], output_path: str) -> str:
        """
        Concatenate multiple video clips into one.

        Args:
            video_paths: List of video file paths
            output_path: Output file path

        Returns:
            Path to the concatenated video
        """
        if len(video_paths) == 1:
            # Single video — just copy it
            import shutil
            shutil.copy(video_paths[0], output_path)
            return output_path

        # Create concat list file
        temp_list = tempfile.NamedTemporaryFile(
            mode="w", suffix=".txt", delete=False, dir=self.config.temp_dir
        )
        for path in video_paths:
            # FFmpeg concat demuxer requires absolute paths
            abs_path = os.path.abspath(path)
            temp_list.write(f"file '{abs_path}'\n")
        temp_list.close()

        try:
            self._run_ffmpeg(
                [
                    "-y", "-f", "concat", "-safe", "0",
                    "-i", temp_list.name,
                    "-c", "copy",
                    output_path,
                ],
                desc=f"Concat {len(video_paths)} clips",
            )
        finally:
            os.unlink(temp_list.name)

        console.print(f"[green]✓ Concatenated {len(video_paths)} clips → {output_path}[/green]")
        return output_path

    def mix_audio(
        self,
        video_path: str,
        audio_paths: List[tuple],
        output_path: str,
        duck_factor: float = 0.3,  # Lower music volume under voiceover
    ) -> str:
        """
        Mix audio tracks onto a video.

        Args:
            video_path: The video to add audio to
            audio_paths: List of (audio_path, track_type) where track_type is
                         "voiceover" | "music" | "sfx"
            output_path: Output file path
            duck_factor: How much to lower non-voiceover audio when voiceover is present

        Returns:
            Path to the output video
        """
        if not audio_paths:
            return video_path

        # Build FFmpeg filter graph for mixing
        inputs = ["-i", video_path]
        for path, _ in audio_paths:
            inputs.extend(["-i", path])

        # Build filter complex
        filters = []
        input_idx = 1  # Video is input 0

        has_voiceover = any(t == "voiceover" for _, t in audio_paths)

        for i, (path, track_type) in enumerate(audio_paths):
            if track_type == "voiceover":
                # Voiceover at full volume
                filters.append(f"[{input_idx}:a]volume=1.0[a{i}]")
            elif track_type == "music" and has_voiceover:
                # Duck music under voiceover
                filters.append(f"[{input_idx}:a]volume={duck_factor}[a{i}]")
            else:
                filters.append(f"[{input_idx}:a]volume=0.5[a{i}]")
            input_idx += 1

        # Mix all audio tracks
        audio_labels = "".join(f"[a{i}]" for i in range(len(audio_paths)))
        filters.append(f"{audio_labels}amix=inputs={len(audio_paths)}:duration=longest[mix]")

        filter_complex = ";".join(filters)

        self._run_ffmpeg(
            [
                "-y",
                *inputs,
                "-filter_complex", filter_complex,
                "-map", "0:v",
                "-map", "[mix]",
                "-c:v", "copy",
                "-c:a", "aac", "-b:a", "192k",
                "-shortest",
                output_path,
            ],
            desc=f"Mix {len(audio_paths)} audio tracks",
        )
        console.print(f"[green]✓ Audio mixed: {output_path}[/green]")
        return output_path

    def burn_captions(
        self,
        video_path: str,
        subtitle_path: str,
        output_path: str,
        style: str = "bold",
    ) -> str:
        """
        Burn subtitle/caption file into video.

        Args:
            video_path: Input video
            subtitle_path: .srt or .ass subtitle file
            output_path: Output video with burned captions
            style: Caption style preset

        Returns:
            Path to output video
        """
        # Build subtitle style
        styles = {
            "bold": "Fontsize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=1",
            "hud": "Fontsize=20,PrimaryColour=&H0000E5FF,OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=0",
            "clean": "Fontsize=22,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=1,Shadow=0",
        }
        subtitle_style = styles.get(style, styles["bold"])

        self._run_ffmpeg(
            [
                "-y", "-i", video_path,
                "-vf", f"subtitles={subtitle_path}:force_style='{subtitle_style}'",
                "-c:a", "copy",
                "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                output_path,
            ],
            desc=f"Burn captions ({style})",
        )
        console.print(f"[green]✓ Captions burned: {output_path}[/green]")
        return output_path

    def export_final(
        self,
        video_path: str,
        output_path: str,
        codec: Optional[str] = None,
        quality: str = "high",  # "high" | "medium" | "web"
    ) -> str:
        """
        Final export with quality presets.

        Args:
            video_path: Input video
            output_path: Output path
            codec: Override codec (h264, h265, prores)
            quality: Quality preset

        Returns:
            Path to final exported video
        """
        codec = codec or self.default_codec

        presets = {
            "high": {"preset": "slow", "crf": "16", "b:a": "320k"},
            "medium": {"preset": "medium", "crf": "20", "b:a": "192k"},
            "web": {"preset": "fast", "crf": "24", "b:a": "128k"},
        }
        settings = presets.get(quality, presets["high"])

        codec_map = {
            "h264": ("libx264", "yuv420p"),
            "h265": ("libx265", "yuv420p"),
            "prores": ("prores_ks", "yuv422p10le"),
        }
        vcodec, pix_fmt = codec_map.get(codec, ("libx264", "yuv420p"))

        self._run_ffmpeg(
            [
                "-y", "-i", video_path,
                "-c:v", vcodec, "-preset", settings["preset"], "-crf", settings["crf"],
                "-pix_fmt", pix_fmt,
                "-c:a", "aac", "-b:a", settings["b:a"],
                output_path,
            ],
            desc=f"Final export ({codec}, {quality})",
        )
        console.print(f"[green]✓ Final export: {output_path}[/green]")
        return output_path
