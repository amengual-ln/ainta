"""Genera el retrato dither de Karen usando Pillow, sin trabajo por frame.

Uso: python3 scripts/karen-portrait.py
La ilustración y las fuentes se documentan en public/portraits/ATTRIBUTION.md.
"""
import re
from pathlib import Path

from PIL import Image, ImageChops, ImageOps

root = Path(__file__).resolve().parent.parent
source = root / "public/portraits/karen-illustration-source.png"
output = root / "public/portraits/karen-dither.png"

# El acento se toma del mismo token que usa la web.
css = (root / "app/globals.css").read_text()
accent = re.search(r"--accent-soft:\s*(#[0-9a-fA-F]{6})", css)
if not accent:
    raise ValueError("No se encontró --accent-soft en globals.css")

image = Image.open(source).convert("RGBA")
image = ImageOps.fit(image, (360, 450), method=Image.Resampling.LANCZOS)
alpha = image.getchannel("A")
gray = ImageChops.multiply(image.convert("L"), alpha)
gray = ImageOps.autocontrast(gray, cutoff=1, mask=alpha)
dots = gray.convert("1", dither=Image.Dither.FLOYDSTEINBERG).convert("L")

portrait = Image.new("RGBA", image.size, accent.group(1))
portrait.putalpha(ImageChops.multiply(dots, alpha))
portrait = portrait.resize((720, 900), Image.Resampling.NEAREST)
portrait.save(output, optimize=True)

# Los puntos nunca rellenan el fondo transparente de la ilustración.
assert portrait.mode == "RGBA"
assert portrait.getpixel((0, 0))[3] == 0
assert portrait.getchannel("A").getextrema()[1] == 255
print(f"OK {output} ({output.stat().st_size:,} bytes)")
