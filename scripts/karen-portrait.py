"""Genera el dither y los fragmentos ASCII de Karen, sin trabajo por frame.

Uso: python3 scripts/karen-portrait.py
La ilustración y las fuentes se documentan en public/portraits/ATTRIBUTION.md.
"""
import re
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageOps

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

# Los glifos siguen la luminosidad y la silueta de la misma ilustración.
font = ImageFont.truetype(
    str(root / "node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf"), 24
)
glyphs = " .:+*x01#@"
levels = gray.resize((45, 36), Image.Resampling.BOX)
silhouette = alpha.resize(levels.size, Image.Resampling.BOX)
# Un velo tenue separa los glifos sin ocultar el dither de Karen.
background = re.search(r"--bg:\s*(#[0-9a-fA-F]{6})", css)
if not background:
    raise ValueError("No se encontró --bg en globals.css")
ascii_portrait = Image.new("RGBA", (720, 900), background.group(1))
ascii_portrait.putalpha(
    alpha.point(lambda value: 51 if value >= 128 else 0)
    .resize((720, 900), Image.Resampling.NEAREST)
)
draw = ImageDraw.Draw(ascii_portrait)
for y in range(36):
    for x in range(45):
        if silhouette.getpixel((x, y)) < 128:
            continue
        glyph = glyphs[levels.getpixel((x, y)) * (len(glyphs) - 1) // 255]
        draw.text((x * 16 + 8, y * 25 + 12.5), glyph, font=font,
                  fill=accent.group(1), anchor="mm")

# La capa conserva el fondo vacío y contiene glifos antes de guardarse.
assert ascii_portrait.getpixel((0, 0))[3] == 0
assert ascii_portrait.getchannel("A").histogram()[51] > 0
assert ascii_portrait.getchannel("A").getextrema()[1] == 255
ascii_output = output.with_name("karen-ascii.png")
ascii_portrait.save(ascii_output, optimize=True)
print(f"OK {ascii_output} ({ascii_output.stat().st_size:,} bytes)")
