"""Genera lib/karen-density.ts a partir de la foto de Karen Spärck Jones.

Uso: python3 scripts/karen-density.py [ruta-a-la-foto]

Fuente predeterminada: public/portraits/karen-sparck.jpg, University of
Cambridge, CC BY 2.5. Ver public/portraits/ATTRIBUTION.md.

Separa a Karen del fondo gris (lo cálido o claro es ella) y guarda dos
grillas de 96x120 con 16 niveles (un carácter hexadecimal por celda):
- brillo: qué tan clara se ve cada zona;
- relieve: una profundidad aproximada, que infla la silueta como un globo y
  adelanta un poco las zonas claras (frente, nariz, pómulos).
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

WIDTH, HEIGHT = 96, 120
SCALE = 4

def clamp(value):
    return max(0.0, min(1.0, value))

root = Path(__file__).resolve().parent.parent
source = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "public/portraits/karen-sparck.jpg"
photo = Image.open(source).convert("RGB")
crop_width = round(photo.height * WIDTH / HEIGHT)
left = (photo.width - crop_width) // 2
photo = photo.crop((left, 0, left + crop_width, photo.height))
photo = photo.resize((WIDTH * SCALE, HEIGHT * SCALE), Image.LANCZOS)

mask = Image.new("L", photo.size)
tone = Image.new("L", photo.size)
for y in range(photo.height):
    for x in range(photo.width):
        r, g, b = photo.getpixel((x, y))
        luma = 0.299 * r + 0.587 * g + 0.114 * b
        subject = max(clamp((r - b - 18) / 45), clamp((luma - 115) / 50))
        mask.putpixel((x, y), int(subject * 255))
        tone.putpixel((x, y), int(0.45 * max(r, g, b) + 0.55 * luma))

mask = mask.filter(ImageFilter.MedianFilter(7)).filter(ImageFilter.GaussianBlur(3))

density = Image.new("L", photo.size)
for y in range(photo.height):
    for x in range(photo.width):
        m = mask.getpixel((x, y)) / 255
        t = tone.getpixel((x, y)) / 255
        density.putpixel((x, y), int(255 * clamp(m * (0.12 + 1.05 * t ** 1.6))))
density = density.resize((WIDTH, HEIGHT), Image.LANCZOS)

bulge = mask.filter(ImageFilter.GaussianBlur(64))
peak = bulge.getextrema()[1] or 1
depth = Image.new("L", photo.size)
for y in range(photo.height):
    for x in range(photo.width):
        m = mask.getpixel((x, y)) / 255
        b = bulge.getpixel((x, y)) / peak
        t = tone.getpixel((x, y)) / 255
        # Los hombros quedan más atrás que la cara.
        back = 1 - 0.35 * clamp((y / photo.height - 0.62) / 0.3)
        depth.putpixel((x, y), int(255 * clamp(m * back * (0.82 * b ** 1.2 + 0.18 * t))))
depth = depth.filter(ImageFilter.GaussianBlur(4)).resize((WIDTH, HEIGHT), Image.LANCZOS)

def grid(image):
    rows = [
        "".join("%x" % (image.getpixel((x, y)) >> 4) for x in range(WIDTH))
        for y in range(HEIGHT)
    ]
    return "\n".join(f'  "{row}",' for row in rows)
output = root / "lib" / "karen-density.ts"
output.write_text(
    "// Generado por scripts/karen-density.py: no editar a mano.\n"
    "// University of Cambridge, CC BY 2.5; ver public/portraits/ATTRIBUTION.md.\n"
    f"export const KAREN_DENSITY_WIDTH = {WIDTH};\n"
    f"export const KAREN_DENSITY_HEIGHT = {HEIGHT};\n\n"
    "// Un carácter hexadecimal por celda: 0 es fondo, f es lo más claro.\n"
    f"export const KAREN_DENSITY = [\n{grid(density)}\n].join(\"\");\n\n"
    "// Un carácter hexadecimal por celda: 0 es fondo, f es lo más cercano.\n"
    f"export const KAREN_DEPTH = [\n{grid(depth)}\n].join(\"\");\n"
)
print(f"OK {output}")

# Respaldo estático: se muestra sin JS, sin WebGL2 y ante pérdida del contexto.
fallback = Image.new("RGBA", (WIDTH * 8, HEIGHT * 8))
draw = ImageDraw.Draw(fallback)
font = ImageFont.load_default(size=8)
glyphs = "·:+×<>1{}0#"
for y in range(HEIGHT):
    for x in range(WIDTH):
        value = density.getpixel((x, y)) / 255
        if value < 0.025:
            continue
        alpha = round(255 * min(1, 0.1 + value ** 1.25 * 0.95))
        glyph = glyphs[round(value * (len(glyphs) - 1))]
        color = (93, 201, 168, alpha) if value > 0.7 else (240, 240, 245, alpha)
        draw.text((x * 8, y * 8), glyph, font=font, fill=color)
fallback_path = root / "public/karen-glyph-portrait.png"
fallback.save(fallback_path, optimize=True)
print(f"OK {fallback_path}")
