# AINTA — Design System

## Filosofía de diseño

Minimalista, oscuro, atmosférico. El diseño no compite con el contenido — lo sostiene. Sin decoración por decoración. Las animaciones son suaves y continuas, nunca llamativas. La sensación general es de profundidad y seriedad sin ser fría.

Referencias de tono visual: Dacade, Orbitia, SAIA. No replicar — absorber el espíritu.

**Principios:**
- Menos es más: cada elemento tiene que ganarse su lugar
- El movimiento es atmosférico, no funcional — no distrae, ambienta
- La jerarquía tipográfica hace el trabajo pesado
- Los bordes y separadores son casi invisibles

---

## Colores

```css
:root {
  /* Fondos */
  --bg:       #080B10;   /* fondo principal — casi negro azulado */
  --bg2:      #0D1117;   /* fondo de cards */

  /* Acento principal */
  --indigo:      #6366F1;              /* índigo puro — CTAs, highlights */
  --indigo-soft: #818CF8;              /* índigo claro — labels, links secundarios */
  --indigo-dim:  rgba(99,102,241,0.12); /* índigo muy tenue — fondos de badges */

  /* Texto */
  --white:  #F0F0F5;   /* blanco roto — texto principal */
  --muted:  #8B8FA8;   /* gris medio — texto secundario, metadata */

  /* Bordes y superficies */
  --border:   rgba(139,143,168,0.12);  /* borde muy sutil */
  --card-bg:  rgba(13,17,23,0.60);     /* fondo de cards con blur */
}
```

### Paleta de tags de eventos
```css
/* Taller */
border-color: rgba(99,102,241,0.3);
color: #818CF8;

/* Charla */
border-color: rgba(167,139,250,0.3);
color: #c4b5fd;

/* Externo */
border-color: rgba(139,143,168,0.2);
color: #8B8FA8;
```

### Canales de comunidad
```css
/* Telegram */
background: rgba(36,161,222,0.12);
border: rgba(36,161,222,0.25);
color: #60c8f5;

/* Discord */
background: rgba(88,101,242,0.12);
border: rgba(88,101,242,0.25);
color: #8b9cf7;

/* Newsletter */
background: rgba(99,102,241,0.12);
border: rgba(99,102,241,0.25);
color: #818CF8;
```

---

## Tipografía

### Familias
```
Display / headings:  Space Grotesk (Google Fonts) — weights: 300 400 500 600 700
Body / UI:           Inter (Google Fonts)          — weights: 300 400 500
```

### Escala
| Rol | Familia | Tamaño | Weight | Tracking |
|-----|---------|--------|--------|----------|
| Hero title | Space Grotesk | clamp(42px, 6vw, 80px) | 700 | -0.04em |
| Section title | Space Grotesk | clamp(28px, 3.5vw, 44px) | 600 | -0.03em |
| Card title | Space Grotesk | 17–18px | 600 | -0.02em |
| Logo | Space Grotesk | 18px | 600 | -0.02em |
| Nav CTA | Space Grotesk | 13px | 500 | 0.01em |
| Body | Inter | 16px | 400 | 0 |
| Hero subtitle | Inter | 18px | 300 | 0 |
| Eyebrow / tag | Inter | 11–12px | 500 | 0.10–0.14em |
| Metadata | Inter | 13–14px | 400 | 0 |

### Reglas
- Todos los headings: `line-height: 1.05–1.15`, tracking negativo
- Body text: `line-height: 1.6–1.7`
- Eyebrows y section-tags: siempre uppercase + letter-spacing amplio
- Nunca mezclar más de dos familias en un mismo componente

---

## Animaciones

### Orbs de fondo
Tres divs con `position: fixed`, `border-radius: 50%`, `filter: blur(80px)`. Cada uno con su propia animación de float independiente — duraciones distintas para que nunca se sincronicen.

```css
.bg-orb-1 { animation: orbFloat1 20s ease-in-out infinite alternate; }
.bg-orb-2 { animation: orbFloat2 26s ease-in-out infinite alternate; }
.bg-orb-3 { animation: orbFloat3 22s ease-in-out infinite alternate; }
```

Cada keyframe combina `translate` + `scale` en tres puntos intermedios para que el movimiento sea orgánico, no lineal. El rango de movimiento es 30–80px en X/Y y 0.92–1.1 en escala.

**Importante:** nunca usar `position: absolute` en el body — deben ser `fixed` para que no afecten el scroll.

### Hero — entrada en cascada
Cada elemento del hero entra con `fadeUp` con delay incremental:

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.eyebrow  { animation: fadeUp 0.8s ease 0.20s forwards; }
.hero-title { animation: fadeUp 0.8s ease 0.35s forwards; }
.hero-sub   { animation: fadeUp 0.8s ease 0.50s forwards; }
.hero-actions { animation: fadeUp 0.8s ease 0.65s forwards; }
.hero-stat-row { animation: fadeUp 0.8s ease 0.80s forwards; }
```

Todos empiezan con `opacity: 0` en CSS para que no flasheen antes de animar.

### Scroll reveal
`IntersectionObserver` con threshold `0.12`. Al entrar en viewport, se agrega clase `.visible` que activa:

```css
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Logo dot
```css
@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 12px #6366F1; }
  50%       { opacity: 0.6; box-shadow: 0 0 6px #6366F1; }
}
/* duración: 2s ease-in-out infinite */
```

### Hover en cards
`background` transition de 0.2–0.3s hacia `rgba(99,102,241,0.05–0.06)`. Sin transform, sin sombra exagerada — el cambio de fondo es suficiente.

### Preferencias de movimiento reducido
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Componentes

### Nav
- `position: fixed`, `z-index: 100`
- `background: transparent`, sin borde — integrado visualmente al hero
- Al hacer scroll puede agregarse un `backdrop-filter: blur(20px)` + fondo `rgba(8,11,16,0.8)` en v2 (con JS que detecte `scrollY > 60`)
- Padding: `28px 40px`

### Botones

**Primario:**
```css
background: #6366F1;
color: #fff;
padding: 14px 28px;
border-radius: 10px;
font: 500 15px Space Grotesk;
/* hover: translateY(-1px) + box-shadow indigo */
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

**Nav CTA:**
```css
background: var(--indigo-dim);
border: 1px solid rgba(99,102,241,0.4);
color: var(--indigo-soft);
padding: 9px 20px;
border-radius: 8px;
```

### Cards (grids de pilares y recursos)
- `background: var(--card-bg)` con `backdrop-filter: blur(12px)`
- Separadas por `gap: 2px` sobre un contenedor con `border: 1px solid var(--border)` y `border-radius: 16px; overflow: hidden`
- Este patrón crea la ilusión de una grilla unificada con bordes finos entre cards
- Hover: `background` ligeramente más claro + línea de acento en el top (`::before` con gradiente indigo)

### Event list items
- Grid de 3 columnas: `80px / 1fr / auto` (fecha / info / tag)
- Separados por `gap: 2px` con el mismo patrón de contenedor que las cards
- Fecha: número grande (28px, 700) + mes uppercase pequeño en índigo

### Section tags (eyebrows)
```
font: 500 11px Inter
letter-spacing: 0.14em
text-transform: uppercase
color: var(--indigo-soft)
margin-bottom: 16px
```

---

## Layout y espaciado

```
Max-width contenedor: 1080px
Padding horizontal:   24px (mobile) / 24px (desktop, el max-width hace el trabajo)
Nav padding:          28px 40px

Secciones: padding-top/bottom 80–120px
Hero: padding-top 120px (compensa el nav fijo), min-height 100vh

Gap entre cards (grids): 2px
Border-radius cards:      16px (contenedor) / 0 (cards individuales)
Border-radius botones:    8–10px
Border-radius badges:     20px (pill)
```

---

## Responsive

### Breakpoint principal: 768px

```css
@media (max-width: 768px) {
  nav { padding: 16px 20px; }
  .nav-links { display: none; }          /* hamburger en v2 */
  .pillars-grid { grid-template-columns: 1fr; }
  .resources-grid { grid-template-columns: 1fr; }
  .event-item { grid-template-columns: 60px 1fr; } /* se oculta el tag */
  .join-card { padding: 48px 28px; }
  .hero-stat-row { gap: 24px; flex-wrap: wrap; }
}
```

---

## Estructura de archivos sugerida (Next.js)

```
/app
  layout.tsx          ← fuentes, metadata global, orbs de fondo
  page.tsx            ← landing (todas las secciones)
  /eventos
    page.tsx
  /recursos
    page.tsx

/components
  Nav.tsx
  Hero.tsx
  Pillars.tsx
  Events.tsx
  Resources.tsx
  JoinSection.tsx
  Footer.tsx
  BgOrbs.tsx          ← los tres divs animados, client component
  ScrollReveal.tsx    ← wrapper con IntersectionObserver

/lib
  events.ts           ← data estática o fetch a CMS
  resources.ts

/styles
  globals.css         ← variables CSS, reset, tipografía base
```
