#!/usr/bin/env bash
# The Canvas — Model Download Script
# Run this to download all models to a specified directory.
# 
# Usage: bash download_models.sh /path/to/models/dir
# Default: H:/models (Windows) or ~/models (Mac)

MODEL_DIR="${1:-H:/models}"
mkdir -p "$MODEL_DIR"

echo "========================================"
echo "  The Canvas — Downloading Models"
echo "  Destination: $MODEL_DIR"
echo "========================================"
echo ""

# Install huggingface-cli if needed
pip install -q "huggingface_hub[cli]" 2>/dev/null

echo "[1/5] Wan 2.2 T2V-A14B (~50GB) — text-to-video, highest quality..."
huggingface-cli download Wan-AI/Wan2.2-T2V-A14B --local-dir "$MODEL_DIR/Wan2.2-T2V-A14B"
echo "  ✓ Done"
echo ""

echo "[2/5] Wan 2.2 TI2V-5B (~20GB) — lighter, T2V + I2V..."
huggingface-cli download Wan-AI/Wan2.2-TI2V-5B --local-dir "$MODEL_DIR/Wan2.2-TI2V-5B"
echo "  ✓ Done"
echo ""

echo "[3/5] FLUX.2 Klein 4B (~13GB) — image generation..."
huggingface-cli download black-forest-labs/FLUX.2-Klein-4B --local-dir "$MODEL_DIR/FLUX2-Klein-4B"
echo "  ✓ Done"
echo ""

echo "[4/5] LTX-2.3 (~8GB) — fast video generation..."
huggingface-cli download Lightricks/LTX-2.3 --local-dir "$MODEL_DIR/LTX-2.3"
echo "  ✓ Done"
echo ""

echo "[5/5] Kokoro TTS (~2GB) — voiceover..."
huggingface-cli download hexgrad/Kokoro-82M --local-dir "$MODEL_DIR/Kokoro-82M"
echo "  ✓ Done"
echo ""

echo "========================================"
echo "  All models downloaded to $MODEL_DIR"
echo "========================================"
