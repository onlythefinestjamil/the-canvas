#!/usr/bin/env powershell
# The Canvas — Windows Setup Script (for Melene)
# Run this on the Windows PC to download models and install dependencies
# 
# Usage: powershell -ExecutionPolicy Bypass -File setup.ps1
#
# This downloads all model weights to H:\models and installs Python deps.
# Your RX 6800 (16GB VRAM) + 128GB RAM handles everything locally.

$ErrorActionPreference = "Stop"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  The Canvas — Windows Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ─── 1. Create directories ───
Write-Host "[1/6] Creating directories..." -ForegroundColor Yellow
$dirs = @("H:\models", "H:\canvas-outputs", "H:\canvas-temp", "H:\canvas-outputs\logs")
foreach ($d in $dirs) {
    if (!(Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
}
Write-Host "  ✓ Directories created on H:" -ForegroundColor Green

# ─── 2. Install Python dependencies ───
Write-Host ""
Write-Host "[2/6] Installing Python dependencies..." -ForegroundColor Yellow
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Standard torch failed, trying CPU version..." -ForegroundColor DarkYellow
    pip install torch torchvision torchaudio
}
pip install diffusers transformers accelerate safetensors
pip install huggingface_hub[cli]
pip install soundfile scipy imageio imageio-ffmpeg
pip install click rich pydantic pyyaml
pip install torch-directml 2>$null  # For AMD GPU
if ($LASTEXITCODE -ne 0) {
    Write-Host "  torch-directml not available — will use CPU fallback or CUDA" -ForegroundColor DarkYellow
}
Write-Host "  ✓ Python dependencies installed" -ForegroundColor Green

# ─── 3. Install FFmpeg ───
Write-Host ""
Write-Host "[3/6] Checking FFmpeg..." -ForegroundColor Yellow
$ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (!$ffmpeg) {
    Write-Host "  Installing FFmpeg via winget..." -ForegroundColor Yellow
    winget install ffmpeg
} else {
    Write-Host "  ✓ FFmpeg already installed" -ForegroundColor Green
}

# ─── 4. Download models ───
Write-Host ""
Write-Host "[4/6] Downloading models to H:\models..." -ForegroundColor Yellow
Write-Host "  This will take a while — models are large." -ForegroundColor DarkYellow
Write-Host ""

# Wan 2.2 T2V-A14B (text-to-video, ~50GB)
Write-Host "  [4a] Wan 2.2 T2V-A14B (~50GB)..." -ForegroundColor Yellow
huggingface-cli download Wan-AI/Wan2.2-T2V-A14B --local-dir H:\models\Wan2.2-T2V-A14B

# Wan 2.2 TI2V-5B (lighter, T2V+I2V, ~20GB)
Write-Host ""
Write-Host "  [4b] Wan 2.2 TI2V-5B (~20GB)..." -ForegroundColor Yellow
huggingface-cli download Wan-AI/Wan2.2-TI2V-5B --local-dir H:\models\Wan2.2-TI2V-5B

# FLUX.2 Klein (image generation, ~13GB)
Write-Host ""
Write-Host "  [4c] FLUX.2 Klein 4B (~13GB)..." -ForegroundColor Yellow
huggingface-cli download black-forest-labs/FLUX.2-Klein-4B --local-dir H:\models\FLUX2-Klein-4B

# LTX-2.3 (fast video, ~8GB)
Write-Host ""
Write-Host "  [4d] LTX-2.3 (~8GB)..." -ForegroundColor Yellow
huggingface-cli download Lightricks/LTX-2.3 --local-dir H:\models\LTX-2.3

# Kokoro TTS (~2GB)
Write-Host ""
Write-Host "  [4e] Kokoro TTS (~2GB)..." -ForegroundColor Yellow
huggingface-cli download hexgrad/Kokoro-82M --local-dir H:\models\Kokoro-82M

# HunyuanVideo (~14GB) — optional, for higher quality video
Write-Host ""
Write-Host "  [4f] HunyuanVideo 1.5 (~14GB) — optional..." -ForegroundColor DarkYellow
$huny = Read-Host "  Download HunyuanVideo? (y/n)"
if ($huny -eq "y") {
    huggingface-cli download tencent/HunyuanVideo-1.5 --local-dir H:\models\HunyuanVideo-1.5
}

Write-Host ""
Write-Host "  ✓ All models downloaded to H:\models" -ForegroundColor Green

# ─── 5. Clone The Canvas repo ───
Write-Host ""
Write-Host "[5/6] Cloning The Canvas..." -ForegroundColor Yellow
if (Test-Path "H:\the-canvas") {
    Write-Host "  H:\the-canvas already exists — pulling latest..." -ForegroundColor DarkYellow
    Set-Location H:\the-canvas
    git pull
} else {
    git clone https://github.com/onlythefinestjamil/the-canvas.git H:\the-canvas
}
Set-Location H:\the-canvas
Write-Host "  ✓ The Canvas cloned to H:\the-canvas" -ForegroundColor Green

# ─── 6. Test ───
Write-Host ""
Write-Host "[6/6] Running smoke test..." -ForegroundColor Yellow
python -c "from the_canvas.config import CanvasConfig; c = CanvasConfig.load('config.yaml'); print('Config OK:', c.model_dir)"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Smoke test passed" -ForegroundColor Green
} else {
    Write-Host "  ✗ Smoke test failed — check dependencies" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  To generate:" -ForegroundColor White
Write-Host "    cd H:\the-canvas" -ForegroundColor White
Write-Host "    python main.py `"30-second ad for a clothing brand`"" -ForegroundColor White
Write-Host ""
Write-Host "  To start the web UI:" -ForegroundColor White
Write-Host "    python web_ui.py" -ForegroundColor White
Write-Host ""
