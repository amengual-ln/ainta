"use client";

import { useEffect, useRef } from "react";
import {
  glyphHash,
  idleHeadPose,
  glyphIndexForCell,
  PORTRAIT_GLYPHS,
  portraitDensity,
  portraitDepth,
  portraitNormal,
  portraitParticleDensity,
} from "@/lib/glyph-portrait";

const GLYPH_INTERVAL_MS = 140;
const PARTICLE_INTERVAL_MS = 560;
const GLITCH_INTERVAL_MS = 900;
const POINT_FLOATS = 8;
const LOOK_FLOATS = 4;

// Cada glifo es un cuadradito que la GPU mueve en 3D y alumbra.
// Todos salen en una sola llamada: con canvas 2D, miles de glifos por cuadro
// no llegan a 30 fps en una GPU integrada.
const VERTEX_SHADER = `#version 300 es
precision highp float;

layout(location = 0) in vec4 a_point;  // u, v, profundidad, semilla
layout(location = 1) in vec4 a_normal; // normal, fila
layout(location = 2) in vec4 a_look;   // glifo, alfa (0 = oculto), parpadeo, tipo

uniform vec2 u_view;    // tamaño en px CSS
uniform vec4 u_turn;    // cos y sen del giro horizontal y del vertical de la cabeza
uniform vec2 u_roll;    // cos y sen de la inclinación de la cabeza
uniform vec4 u_motion;  // segundos, respiración en px, quieto, fila del barrido
uniform vec4 u_glitch;  // activo, fila inicial, fila final, corrimiento en px
uniform float u_echo;   // 1 en la pasada del eco verde del glitch
uniform float u_tile;   // casillero del glifo en px CSS
uniform float u_glyphs; // glifos en la hoja
uniform vec3 u_light;

out vec2 v_uv;
out float v_alpha;
out vec3 v_color;

const vec3 WHITE = vec3(240.0, 240.0, 245.0) / 255.0;
const vec3 GREEN = vec3(93.0, 201.0, 168.0) / 255.0;

vec3 turn(vec3 p) {
  float x1 = p.x * u_turn.x + p.z * u_turn.y;
  float z1 = -p.x * u_turn.y + p.z * u_turn.x;
  vec3 q = vec3(x1, p.y * u_turn.z - z1 * u_turn.w, p.y * u_turn.w + z1 * u_turn.z);
  return vec3(q.x * u_roll.x - q.y * u_roll.y, q.x * u_roll.y + q.y * u_roll.x, q.z);
}

void main() {
  vec2 corner = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1));
  float time = u_motion.x;
  float still = u_motion.z;
  float row = a_normal.w;
  float particle = step(1.5, a_look.w);
  float accent = mod(a_look.w, 2.0);
  bool inGlitch = u_glitch.x > 0.5 && row >= u_glitch.y && row < u_glitch.z;

  if (a_look.y == 0.0 || (u_echo > 0.5 && !inGlitch)) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }

  vec2 uv = a_point.xy;
  float depth = a_point.z;
  float alive = (1.0 - particle) * (1.0 - still);

  // Solo la cabeza se mueve; los hombros quedan quietos y el cuello acompaña a medias.
  float head = 1.0 - smoothstep(0.58, 0.8, uv.y);

  // El pelo (el borde de la silueta y la parte de arriba) se mece despacio.
  float hair = head * max(1.0 - smoothstep(0.15, 0.5, depth), 1.0 - smoothstep(0.12, 0.32, uv.y));
  vec2 sway = vec2(
    sin(time * 0.9 + uv.y * 9.0 + uv.x * 3.0) * 2.4,
    cos(time * 0.7 + uv.x * 7.0) * 1.2
  ) * hair * alive;

  // Ondulación leve de toda la superficie, como algo que respira por dentro.
  vec2 pulse = vec2(
    sin(time * 1.1 + uv.y * 14.0 + a_point.w * 2.0),
    cos(time * 0.8 + uv.x * 12.0)
  ) * 0.5 * alive;

  // Las partículas flotan; al respirar suben los hombros y un poco la cabeza.
  float drift = particle * (1.0 - still);
  float breath = u_motion.y * (0.6 + smoothstep(0.62, 0.95, uv.y) * 1.2);
  vec3 body = vec3(
    (uv.x - 0.5) * u_view.x + sin(time / 1.7 + a_point.w * 40.0) * 5.0 * drift,
    (uv.y - 0.5) * u_view.y - breath + cos(time / 2.1 + a_point.w * 30.0) * 4.0 * drift,
    (depth - 0.5) * u_view.x * 0.32
  );
  body.xy += sway + pulse;
  // La cabeza gira sobre el cuello, no sobre el centro de la imagen.
  vec3 neck = vec3(0.0, 0.22 * u_view.y, 0.0);
  vec3 point = mix(body, turn(body - neck) + neck, head * (1.0 - particle));
  float focal = u_view.x * 2.2;
  float scale = focal / (focal - point.z);
  vec2 screen = point.xy * scale;

  vec3 normal = normalize(mix(a_normal.xyz, turn(a_normal.xyz), head));
  float lambert = max(0.0, dot(normal, u_light));
  float rim = pow(1.0 - max(0.0, normal.z), 2.0);
  float closeness = min(1.2, 0.85 + (scale - 1.0) * 3.0);
  float alpha = particle > 0.5
    ? a_look.y
    : min(1.0, a_look.y * (0.68 + lambert * 0.45) * closeness + a_look.z);
  bool green = accent > 0.5 || rim > 0.3;
  if (green) alpha = min(1.0, alpha + rim * 0.4);

  float shift = inGlitch
    ? u_glitch.w
    : (still < 0.5 && mod(row, 17.0) == u_motion.w ? 3.0 : 0.0);
  if (u_echo > 0.5) {
    shift -= u_glitch.w * 0.6;
    alpha *= 0.55;
    green = true;
  }

  vec2 center = u_view * 0.5 + screen + vec2(shift, 0.0);
  vec2 position = center + (corner - 0.5) * u_tile * scale;
  gl_Position = vec4(position / u_view * 2.0 - 1.0, 0.0, 1.0);
  gl_Position.y = -gl_Position.y;

  v_uv = vec2((a_look.x + corner.x) / u_glyphs, corner.y);
  v_alpha = alpha;
  v_color = green ? GREEN : WHITE;
}`;

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;

uniform sampler2D u_atlas;
in vec2 v_uv;
in float v_alpha;
in vec3 v_color;
out vec4 color;

void main() {
  float alpha = texture(u_atlas, v_uv).a * v_alpha;
  color = vec4(v_color * alpha, alpha);
}`;

type GlyphCell = {
  column: number;
  row: number;
  density: number;
  particleDensity: number;
};

function buildCells(columns: number, rows: number) {
  const cells: GlyphCell[] = [];
  const points: number[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const u = (column + 0.5) / columns;
      const v = (row + 0.5) / rows;
      const density = portraitDensity(u, v);
      const particleDensity = portraitParticleDensity(u, v);
      const edgeVisible = glyphHash(column, row, 12) < Math.min(1, density * 6);
      const face = edgeVisible && density > 0.025;
      if (!face && particleDensity === 0) continue;

      const seed = glyphHash(column, row, 40);
      // Las partículas flotan a distintas distancias alrededor de la cabeza.
      const depth = face ? portraitDepth(u, v) : 0.2 + seed * 0.6;
      const normal = face ? portraitNormal(u, v) : [0, 0, 1];
      cells.push({ column, row, density: face ? density : 0, particleDensity });
      points.push(u, v, depth, seed, ...normal, row);
    }
  }
  return { cells, points: new Float32Array(points) };
}

// Lo que cambia solo cuando cambian los glifos (cada GLYPH_INTERVAL_MS).
function buildLooks(
  cells: GlyphCell[],
  phase: number,
  particlePhase: number,
  looks: Float32Array,
) {
  cells.forEach(({ column, row, density, particleDensity }, index) => {
    const isParticle = density === 0;
    const shown = !isParticle ||
      glyphHash(column, row, particlePhase) > 1 - particleDensity * 0.32;
    const accent = (density > 0.7 || isParticle) && glyphHash(column, row, 4) > 0.72;
    const offset = index * LOOK_FLOATS;
    looks[offset] = glyphIndexForCell(column, row, phase, density);
    looks[offset + 1] = !shown
      ? 0
      : isParticle
        ? Math.min(0.34, 0.08 + particleDensity * 0.3)
        : 0.1 + density ** 1.25 * 0.95;
    looks[offset + 2] = glyphHash(column, row, phase + 3) * 0.06;
    looks[offset + 3] = (accent ? 1 : 0) + (isParticle ? 2 : 0);
  });
}

// Cada glifo se dibuja una sola vez, en blanco, en una hoja que va a la GPU.
function buildAtlas(tile: number, font: string) {
  const atlas = document.createElement("canvas");
  atlas.width = tile * PORTRAIT_GLYPHS.length;
  atlas.height = tile;
  const context = atlas.getContext("2d");
  if (!context) return atlas;
  context.font = `${tile * 0.75}px ${font}, monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#fff";
  PORTRAIT_GLYPHS.forEach((glyph, index) => {
    context.fillText(glyph, index * tile + tile / 2, tile / 2);
  });
  return atlas;
}

function compile(gl: WebGL2RenderingContext) {
  const program = gl.createProgram();
  if (!program) return null;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX_SHADER],
    [gl.FRAGMENT_SHADER, FRAGMENT_SHADER],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

export default function KarenGlyphPortrait() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { antialias: false });
    if (!gl) return;
    const program = compile(gl);
    if (!program) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // La hoja de glifos se dibuja en un canvas 2D, que no resuelve var().
    const monoFont = getComputedStyle(canvas)
      .getPropertyValue("--font-geist-mono")
      .trim() || "monospace";

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const uniforms = {
      view: uniform("u_view"),
      turn: uniform("u_turn"),
      roll: uniform("u_roll"),
      motion: uniform("u_motion"),
      glitch: uniform("u_glitch"),
      echo: uniform("u_echo"),
      tile: uniform("u_tile"),
      glyphs: uniform("u_glyphs"),
      light: uniform("u_light"),
    };

    const pointBuffer = gl.createBuffer();
    const lookBuffer = gl.createBuffer();
    const texture = gl.createTexture();
    const vertexArray = gl.createVertexArray();
    gl.bindVertexArray(vertexArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, POINT_FLOATS * 4, 0);
    gl.vertexAttribDivisor(0, 1);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, POINT_FLOATS * 4, 16);
    gl.vertexAttribDivisor(1, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, lookBuffer);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(2, 1);

    gl.useProgram(program);
    gl.uniform1f(uniforms.glyphs, PORTRAIT_GLYPHS.length);
    // Luz desde arriba a la izquierda, por delante de la cara.
    const light = [-0.45, -0.55, 0.7];
    const lightLength = Math.hypot(...light);
    gl.uniform3f(
      uniforms.light,
      light[0] / lightLength,
      light[1] / lightLength,
      light[2] / lightLength,
    );
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let frame = 0;
    let visible = true;
    let cells: GlyphCell[] = [];
    let looks = new Float32Array(0);
    let gridKey = "";
    let cachedPhase = -1;

    const draw = (time = 0) => {
      const still = reduceMotion.matches;
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.round(width * ratio);
      const pixelHeight = Math.round(height * ratio);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      const columns = Math.max(48, Math.min(76, Math.round(width / 6)));
      const rows = Math.round((columns * height) / width);
      const tile = (width / columns) * 1.6;
      // 25% de margen para que no se vea borroso cuando se acerca.
      const tilePixels = Math.ceil(tile * ratio * 1.25);
      const key = `${columns}x${rows}x${tilePixels}`;
      if (gridKey !== key) {
        const grid = buildCells(columns, rows);
        cells = grid.cells;
        looks = new Float32Array(cells.length * LOOK_FLOATS);
        gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, grid.points, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, lookBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, looks.byteLength, gl.DYNAMIC_DRAW);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
          buildAtlas(tilePixels, monoFont),
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gridKey = key;
        cachedPhase = -1;
      }

      const phase = still ? 0 : Math.floor(time / GLYPH_INTERVAL_MS);
      if (phase !== cachedPhase) {
        buildLooks(cells, phase, Math.floor(time / PARTICLE_INTERVAL_MS), looks);
        gl.bindBuffer(gl.ARRAY_BUFFER, lookBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, looks);
        cachedPhase = phase;
      }

      // Movimientos chicos y lentos de la cabeza, más la respiración.
      const pose = idleHeadPose(time / 1000);
      const yaw = still ? 0 : pose.yaw;
      const pitch = still ? 0 : pose.pitch;
      const roll = still ? 0 : pose.roll;
      const breath = still ? 0 : (Math.sin((time / 4500) * Math.PI * 2) + 1) * 1.2;

      // Glitch: de vez en cuando una franja de filas se corre y deja un eco verde.
      const glitchPhase = still ? 0 : Math.floor(time / GLITCH_INTERVAL_MS);
      const glitchOn = !still && glyphHash(glitchPhase, 0, 31) > 0.62;
      const glitchStart = Math.floor(glyphHash(glitchPhase, 1, 32) * rows);
      const glitchEnd = glitchStart + 2 + Math.floor(glyphHash(glitchPhase, 2, 33) * 5);

      gl.viewport(0, 0, pixelWidth, pixelHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindVertexArray(vertexArray);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform2f(uniforms.view, width, height);
      gl.uniform4f(
        uniforms.turn,
        Math.cos(yaw), Math.sin(yaw), Math.cos(pitch), Math.sin(pitch),
      );
      gl.uniform2f(uniforms.roll, Math.cos(roll), Math.sin(roll));
      gl.uniform4f(uniforms.motion, time / 1000, breath, still ? 1 : 0, phase % 17);
      gl.uniform4f(
        uniforms.glitch,
        glitchOn ? 1 : 0, glitchStart, glitchEnd,
        (glyphHash(glitchPhase, 3, 34) - 0.5) * 24,
      );
      gl.uniform1f(uniforms.tile, tile);

      if (glitchOn) {
        gl.uniform1f(uniforms.echo, 1);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, cells.length);
      }
      gl.uniform1f(uniforms.echo, 0);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, cells.length);
    };

    const animate = (time: number) => {
      draw(time);
      if (visible && !reduceMotion.matches) frame = requestAnimationFrame(animate);
    };

    const restart = () => {
      cancelAnimationFrame(frame);
      draw(performance.now());
      if (visible && !reduceMotion.matches) frame = requestAnimationFrame(animate);
    };

    // Solo anima mientras el retrato está en pantalla.
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      restart();
    });

    const observer = new ResizeObserver(restart);
    observer.observe(canvas);
    visibility.observe(canvas);
    reduceMotion.addEventListener("change", restart);
    restart();

    // Si Geist Mono carga después, se vuelve a armar la hoja con la fuente real.
    let disposed = false;
    document.fonts.ready.then(() => {
      if (disposed) return;
      gridKey = "";
      restart();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      reduceMotion.removeEventListener("change", restart);
      gl.deleteBuffer(pointBuffer);
      gl.deleteBuffer(lookBuffer);
      gl.deleteTexture(texture);
      gl.deleteVertexArray(vertexArray);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="origin-glyph-canvas"
      role="img"
      aria-label="Retrato abstracto de Karen Spärck Jones construido con glifos variables"
    />
  );
}
