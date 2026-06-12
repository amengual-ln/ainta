# AINTA — Web

Landing + hub de la comunidad AINTA (estudiantes y graduados de IA).

Spec: `../spec.md` · Design system: `../design.md` · HTML reference: `../asociacion-ia.html`

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + CSS variables (design tokens)
- Fonts via `next/font` (Space Grotesk + Inter)

## Run

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build && pnpm start
pnpm lint
```

## Estructura

```
app/
  layout.tsx        ← fuentes, metadata, OG, orbs de fondo
  page.tsx          ← landing
  globals.css       ← design tokens + animaciones
  eventos/, recursos/, talleres/  ← v2 placeholders
components/
  Nav, Hero, Pillars, Events, Resources, JoinSection, Footer
  BgOrbs, ScrollReveal, NewsletterForm
lib/
  events.ts         ← data estática de eventos (v2 → CMS)
  resources.ts      ← data estática de categorías de recursos
```

## Pendiente (v1)

- [ ] Reemplazar links placeholder de Telegram/Discord
- [ ] Wireup newsletter → Resend / Buttondown
- [ ] Cargar fotos de miembros fundadores
- [ ] Eventos reales cargados (mín. 2)
- [ ] Recursos curados (mín. 10)

## Pendiente (v2)

- CMS (Notion o Sanity) para eventos/recursos
- Filtros + búsqueda en `/eventos` y `/recursos`
- Auth magic link + perfil de miembro + directorio opt-in
