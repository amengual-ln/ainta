"""Genera lib/karen-density.ts a partir de la foto de Karen Spärck Jones.

Uso: python3 scripts/karen-density.py ~/Descargas/Karen.jpeg

Separa a Karen del fondo gris (lo cálido o claro es ella) y guarda dos
grillas de 96x120 con 16 niveles (un carácter hexadecimal por celda):
- brillo: qué tan clara se ve cada zona;
- relieve: una profundidad aproximada, que infla la silueta como un globo y
  adelanta un poco las zonas claras (frente, nariz, pómulos).
"""
import sys
from pathlib import Path

from PIL import Image, ImageFilter

WIDTH, HEIGHT = 96, 120
SCALE = 4

def clamp(value):
    return max(0.0, min(1.0, value))

photo = Image.open(sys.argv[1]).convert("RGB")
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
output = Path(__file__).resolve().parent.parent / "lib" / "karen-density.ts"
output.write_text(
    "// Generado por scripts/karen-density.py: no editar a mano.\n"
    f"export const KAREN_DENSITY_WIDTH = {WIDTH};\n"
    f"export const KAREN_DENSITY_HEIGHT = {HEIGHT};\n\n"
    "// Un carácter hexadecimal por celda: 0 es fondo, f es lo más claro.\n"
    f"export const KAREN_DENSITY = [\n{grid(density)}\n].join(\"\");\n\n"
    "// Un carácter hexadecimal por celda: 0 es fondo, f es lo más cercano.\n"
    f"export const KAREN_DEPTH = [\n{grid(depth)}\n].join(\"\");\n"
)
print(f"OK {output}")
