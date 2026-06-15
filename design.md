# AINTA — Design System

## Filosofía de diseño

Minimalista, oscuro, atmosférico. El diseño no compite con el contenido — lo sostiene. Sin decoración por decoración. Las animaciones son atmosféricas y siempre motivadas: cada movimiento tiene una razón. La sensación general es de profundidad y seriedad sin ser fría.

Referencias de tono visual: Dacade, Orbitia, SAIA. No replicar — absorber el espíritu.

**Principios:**
- Menos es más: cada elemento tiene que ganarse su lugar
- El movimiento es atmosférico, no funcional — no distrae, ambienta
- La jerarquía tipográfica hace el trabajo pesado
- Los bordes y separadores son casi invisibles
- Una sola fuente de accent color por proyecto — sin múltiples gradientes AI-purple

---

## Colores

### Acento: Emerald curado (B2)

```css
:root {
  --accent:        #34A88B;                       /* base: CTAs, dots, focus rings */
  --accent-soft:   #5DC9A8;                       /* texto highlighted, links */
  --accent-dim:    rgba(52, 168, 139, 0.12);      /* bg de badges */
  --accent-dimmer: rgba(52, 168, 139, 0.06);      /* hover sutil */
}
```

**Por qué B2 y no el emerald Tailwind (`#10B981`)**: B2 desatura un 8% y mueve el hue 5° hacia cian. Queda más mineral/organic y menos "success-color corporativo." Diferencia a AINTA de la masa de landings tech-IA.

**Complementarios (uso limitado)**:
- Sky-300 (`#7DD3FC`) para tags de Charla en eventos, gradient stop en h1.
- Fondo principal: `#080B10` (casi negro azulado cool).
- Texto principal: `#F0F0F5` (blanco roto).
- Texto muted: `#8B8FA8`.

**Color del texto del CTA**: `#062419` (verde-muy-oscuro) sobre `var(--accent)` = ~7:1, pasa WCAG AAA. No usar blanco (3.5:1 falla AA-body).

```css
:root {
  --bg:       #080B10;
  --bg2:      #0D1117;
  --white:    #F0F0F5;
  --muted:    #8B8FA8;
  --border:        rgba(139, 143, 168, 0.12);
  --border-strong: rgba(139, 143, 168, 0.25);  /* inputs, WCAG 1.4.11 */
  --card-bg:       rgba(13, 17, 23, 0.6);
}
```

### Paleta de tags de eventos
```css
/* Taller */
border-color: rgba(93, 201, 168, 0.3);
color: var(--accent-soft);  /* emerald */

/* Charla */
border-color: rgba(125, 211, 252, 0.3);
color: #7DD3FC;             /* sky-300 */

/* Externo */
border-color: var(--border);
color: var(--muted);
```

### Orbs de fondo (3, diversificados)
- Orb 1: `var(--accent-dim)` (emerald, dominante, top-left).
- Orb 2: `rgba(125,211,252,0.06)` (sky-300 muy tenue, bottom-right).
- Orb 3: `rgba(255,255,255,0.025)` (casi imperceptible, mid-left).

No usar tres orbs del mismo color — es un tell AI-purple.

---

## Tipografía

### Familias
```
Display / headings:  Geist Sans  (geisted)
Body / UI:           Geist Sans  (geisted)
Mono:                Geist Mono  (geisted)  — eyebrows, metadata, footer
Pixel (display only): GeistPixelSquare  (geist/font/pixel) — efecto h1
```

### Escala
| Rol | Familia | Tamaño | Weight | Tracking |
|-----|---------|--------|--------|----------|
| Hero title | Geist Sans | clamp(42px, 6vw, 80px) | 700 | -0.04em |
| Section title | Geist Sans | clamp(28px, 3.5vw, 44px) | 600 | -0.03em |
| Card title | Geist Sans | 17–30px | 600 | -0.02 a -0.025em |
| Logo | Geist Sans | 15-18px | 600 | -0.02em |
| Nav CTA | Geist Sans | 13px | 500 | 0.01em |
| Body | Geist Sans | 16px | 400 | 0 |
| Hero subtitle | Geist Sans | 18px | 300 | 0 |
| Eyebrow / tag / Próximo | Geist Mono | 10.5–12px | 500 | 0.10–0.14em |
| Metadata | Geist Sans | 13–14px | 400 | 0 |

### Reglas
- Todos los headings: `line-height: 1.05–1.15`, tracking negativo
- Body text: `line-height: 1.6–1.7`
- Eyebrows y section-tags: siempre uppercase + letter-spacing amplio, en mono
- GeistPixelSquare: SOLO display, nunca en body. Solo en el h1 del hero y (eventualmente) en el slot-asset del hero.

---

## Animaciones

### Orbs de fondo
Tres divs con `position: fixed`, `border-radius: 50%`, `filter: blur(80px)`. Cada uno con su propia animación de float independiente — duraciones distintas para que nunca se sincronicen.

```css
.bg-orb-1 { animation: orbFloat1 20s ease-in-out infinite alternate; }
.bg-orb-2 { animation: orbFloat2 26s ease-in-out infinite alternate; }
.bg-orb-3 { animation: orbFloat3 22s ease-in-out infinite alternate; }
```

### Hero — entrada en cascada
Cada bloque del hero entra con `fadeUp` con delay incremental:

```css
.eyebrow-anim      { animation-delay: 0.20s; }
.hero-sub-anim     { animation-delay: 0.50s; }
.hero-actions-anim { animation-delay: 0.65s; }
.hero-aside-anim   { animation-delay: 0.90s; }
```

### Hero h1 — animación build-up con rise + glitch settle (2 estados)

Cada char del h1 se renderiza con 2 capas stacked (glitch, smooth), ambas en **Geist Sans**. Cero cambio de font.

- **Wrap-level**: cada char arranca con `opacity: 0` + `translateY(20px)` y hace rise + fade-in en 1000ms (mismo `translateY` que los demás textos del hero, pero con duración extendida para que el morph interno sea visible).
- **Layer-level**: la capa `.char-glitch` (aberración cromática 4-shadow + shake horizontal) se desvanece con steps bruscos, la capa `.char-smooth` aparece. Cross-fade simultáneo, 1000ms.

Line delays: 350ms (L1), 550ms (L2), 750ms (L3). Char stagger: 30ms.

**Glitch visual** (4-shadow chromatic aberration, mismo para hero y títulos):
```css
text-shadow:
  3px 0 #7DD3FC,     /* sky-300 derecha (cyan) */
  1.5px 0 #5DC9A8,   /* emerald derecha (sub) */
  -1.5px 0 #F472B6,  /* pink-400 izquierda (sub) */
  -3px 0 #C4B5FD;    /* violet-300 izquierda (lilac) */
```
- Lado derecho: cyan + emerald (frío).
- Lado izquierdo: pink + lilac (cálido, contraparte).
- Sub-shadow a 1.5px para una separación cromática más visible.

**Shake horizontal** (binario, no jelly):
- `@keyframes glitchShakeSettle` con 5 keyframes (0%, 25%, 50%, 75%, 100%).
- `animation-timing-function: step-end` — cada keyframe se mantiene hasta la próxima, sin interpolación suave. Da el feel "digital/binario" en vez de "wobbly."
- 4 saltos discretos: -3px → +3px → -3px → +3px → 0.
- Amplitud constante (±3px), opacidad decayendo 1 → 0.
- Cada char se mantiene 250ms en cada posición antes del salto.

**Reduced motion**: la capa glitch se oculta, smooth queda visible. Wrap animation desactivada.

### Títulos de sección (vía `CharTitle`)

`components/CharTitle.tsx` es un wrapper client-side para los h2 de Pillars, Events, Resources y JoinSection. Misma animación que el hero h1 (rise + glitch settle) pero:

- **Trigger por viewport**: la animación está pausada (`animation-play-state: paused` via `.deferred *`) hasta que el h2 entra al viewport. El componente usa `IntersectionObserver` (threshold 0.1) y al primer trigger se reemplaza la clase `deferred` por `is-revealed`, lo que des-paurea la animación.
- **Alternancia de variante**: cada char recibe `data-seq` pseudo-aleatorio (`(i * 7 + 13) % 2`). Mitad usan el glitch frío (cyan/emerald), mitad el cálido (pink/lilac).
- **Sin line delay**: una sola línea por título, char stagger 25ms.

**Reduced motion**: mismo override del hero (glitch oculto, smooth visible, wrap animation desactivada).

### Logo dot
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.6; }
}
```

Sin glow exterior (`box-shadow`). Solo inner border vía `box-shadow: inset 0 0 0 1px var(--accent-soft)` — esto es un inner ring, no un outer glow.

### Scroll reveal
`IntersectionObserver` con threshold configurable. Al entrar en viewport, se agrega clase `.visible` que activa la transición.

### Hover en cards
`background` transition de 0.25s hacia `var(--accent-dimmer)`. Sin transform, sin sombra exagerada.

### Preferencias de movimiento reducido
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .fade-up, .h1-reveal { opacity: 1; }
  .reveal { opacity: 1; transform: none; }
  .char-glitch, .char-pixel { display: none !important; }
  .char-smooth { opacity: 1 !important; animation: none !important; }
  .logo-dot, .bg-orb { animation: none !important; }
}
```

### Reduced transparency (glassmorphism fallback)
```css
@media (prefers-reduced-transparency: reduce) {
  .bento-cell, .event-item, [style*="backdrop-filter"] {
    backdrop-filter: none !important;
    background-color: var(--bg2) !important;
  }
}
```

---

## Componentes

### Nav
**Removido en v2.** El sitio es una sola landing. La función de los anchor links se pierde; no se compensa con nada en el footer (decisión de minimalismo). Las secciones son auto-explicativas por su posición.

### Botones

**Primario:**
```css
background: var(--accent);
color: #062419;  /* verde-muy-oscuro, ~7:1 sobre el accent */
padding: 14px 28px;
border-radius: 10px;
font: 500 15px Geist Sans;
/* hover: translateY(-1px) + background ligeramente más claro + shadow emerald */
```

**Ghost:**
```css
background: transparent;
border: 1px solid var(--border);
color: var(--muted);
padding: 14px 24px;
border-radius: 10px;
/* hover: color white + border más visible */
```

### Cards
- `background: var(--card-bg)` con `backdrop-filter: blur(12px)`
- Separadas por `gap: 2px` sobre un contenedor con `border: 1px solid var(--border)` y `border-radius: 16px; overflow: hidden`
- Hover: `background` hacia `var(--accent-dimmer)`

### Event list items (hairline divider layout)
- Container con `border-top` + `border-bottom` + `border-radius: 16px`
- Cada item con `border-top: 1px solid var(--border)` (excepto el primero)
- Grid de 3 columnas: `80px / 1fr / auto` (fecha / info / tag)

### Resources bento
- Grid `repeat(2, 1fr)` con `gap: 2px`, `border: 1px solid var(--border)`, `border-radius: 16px`
- Primera cell (`feature`): `grid-column: 1 / -1` (ancho completo), background con gradient `linear-gradient(135deg, var(--accent-dim) 0%, rgba(125, 211, 252, 0.08) 100%)` — esta cell es la "Bento Background Diversity" (no white-on-white).
- Otras 3 cells: `var(--card-bg)` + `backdrop-filter: blur(12px)`.

### Section tags (eyebrows)
```css
font: 500 11-12px Geist Mono
letter-spacing: 0.10–0.14em
text-transform: uppercase
color: var(--accent-soft)
```

**Regla crítica**: máximo 1 eyebrow por 3 secciones. Hero cuenta como 1. En esta landing solo hay 1 (en el hero). No agregar más sin reducir antes.

---

## Layout y espaciado

```
Max-width contenedor: 1080px
Padding horizontal:   24px (mobile) / 24px (desktop, el max-width hace el trabajo)

Secciones: padding-top/bottom 80–120px
Hero:      padding-top 96px, min-height 100dvh (nunca 100vh)

Gap entre cards (grids): 2px
Border-radius:  input 12px · botón 10px · card 16px · badge 999px (pill)
```

### Escala de border-radius (consistency lock)
Todos los containers siguen esta escala. No inventar radios nuevos sin actualizar este doc:
- `8px` — nav/CTA histórico (ya no se usa)
- `10px` — botones (`btn-primary`, `btn-ghost`)
- `12px` — inputs
- `16px` — cards, containers, event list
- `999px` — pills (event tags)

---

## CTA único: "Unirme"

Una sola palabra para el intent de contacto, usada en:
- Hero CTA (única instancia)
- JoinSection heading ("Unirme a AINTA")

Sin "Unirse" / "Unite" / "Sumate" / "Contact" como variantes. Mantener consistencia.

---

## Responsive

### Breakpoints
- Mobile: `< 768px`
- Desktop: `≥ 768px` (md)
- Hero asymmetric grid: `≥ 1024px` (lg)

### Mobile collapse
- Hero: single column, sin slot-asset (oculto en `< lg`).
- Pillars: 1 columna.
- Events: tag column oculto o wrap.
- Resources bento: 1 columna (la cell feature pasa a single column arriba, las otras 3 debajo).
- JoinSection card: padding reducido.
- Footer: stacked.

---

## Estructura de archivos

```
/app
  layout.tsx          ← Geist fonts, metadata global, orbs de fondo
  page.tsx            ← landing
  globals.css         ← design tokens + animaciones
  /api/subscribe      ← newsletter (Notion)
  /eventos            ← v2 placeholder
  /recursos           ← v2 placeholder
  /talleres           ← v2 placeholder

/components
  Hero.tsx            ← con animación híbrida pixel→glitch→smooth
  Pillars.tsx         ← 3-col cards, accent cell con próximo evento
  Events.tsx          ← hairline list, sin eyebrow
  Resources.tsx       ← bento asimétrico 2×2
  JoinSection.tsx     ← card con newsletter form
  Footer.tsx          ← minimal, año dinámico
  BgOrbs.tsx          ← los tres divs animados
  ScrollReveal.tsx    ← wrapper con IntersectionObserver
  NewsletterForm.tsx  ← client component

/lib
  events.ts           ← data estática
  resources.ts        ← data estática
```
