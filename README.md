# The Canvas

**Powered by Momentum Labs**

AI creative generation pipeline — a self-hosted alternative to ElevenLabs Creative Studio. Part of the Momentum Labs creation suite (The Engine Room · The Canvas · the apps).

## What it does

Give it a text description, get back a finished video with:
- AI-generated visuals (images and video clips)
- AI voiceover narration
- Audio mixing
- Optional burned captions
- Final H.264 export

## How it works

```
Prompt → Production Plan → Image/Video per shot → Voiceover → Audio Mix → Composite → Export
```

## Models (all Apache 2.0 / MIT, no patent issues)

| Capability | Model | License | Runs locally? |
|---|---|---|---|
| Image | FLUX.2 Klein 4B | Apache 2.0 | ✅ 13GB VRAM |
| Video (quality) | Wan 2.2 T2V-A14B | Apache 2.0 | ✅ with CPU offload (128GB RAM) |
| Video (fast) | LTX-2.3 | Apache 2.0 | ✅ 8GB VRAM |
| TTS | Kokoro 82M | Apache 2.0 | ✅ 2GB |
| Lip sync | SadTalker | Apache 2.0 | ✅ 4GB |
| Compositing | FFmpeg | LGPL | ✅ |

**Optional API fallback:** fal.ai (only if local models OOM or are too slow)

## Hardware

| Machine | GPU | Use for |
|---|---|---|
| Windows PC (Melene) | AMD Radeon RX 6800 (16GB) + 128GB RAM | Full pipeline — all models run locally |
| Mac (Forge) | M4 Pro (24GB unified) | Image generation via MLX |

## Setup (Windows)

```bash
# 1. Install FFmpeg
winget install ffmpeg

# 2. Install Python dependencies
pip install -r requirements.txt
pip install torch-directml  # For AMD GPU support

# 3. Install Kokoro TTS
pip install kokoro

# 4. Download models to H: drive
pip install huggingface_hub[cli]
huggingface-cli download Wan-AI/Wan2.2-T2V-A14B --local-dir H:\models\Wan2.2-T2V-A14B
huggingface-cli download Wan-AI/Wan2.2-TI2V-5B --local-dir H:\models\Wan2.2-TI2V-5B
# FLUX.2 Klein, LTX-2.3, Kokoro — same pattern

# 5. Edit config.yaml — set model_dir to H:\models

# 6. Run
python main.py "Create a 30-second promo for Herm's Heavy Hauling junk removal service"
```

## Usage

```bash
# Basic — auto quality (Wan 2.2)
python main.py "30-second promo for a junk hauling business"

# Fast mode (LTX-2.3, quicker but lower quality)
python main.py "15s TikTok ad for fitness app" --quality fast

# With captions
python main.py "Product showcase video" --captions hud

# Without voiceover
python main.py "Cinematic landscape montage" --no-voiceover

# Check generation credits/costs
python main.py --credits
```

## Cost

**$0 per generation.** All models run locally on your hardware.

The only cost is if you enable the optional fal.ai API fallback:
- ~$0.01 per image
- ~$0.50 per video clip

The credit tracker logs every generation so you know exactly what each creation costs.

## License

The Canvas code is your own. All models used are Apache 2.0 or MIT licensed for commercial use.
No patent issues — we're composing our own pipeline from legal building blocks, not
reverse-engineering any proprietary platform.
