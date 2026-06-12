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

## Newsletter (suscripciones → Notion DB)

El form de la landing postea a `POST /api/subscribe` → valida → upsert en una database de Notion.

### Setup (one-time)

1. Crear integración: <https://www.notion.so/profile/integrations> → "AINTA Subscribers" → copiar **Internal Integration Token**.
2. Crear una page "AINTA — Subscribers" con database full-page.
3. Schema exacto (case-sensitive):
   - `Email` — **Email**
   - `Name` — **Rich text**
   - `Date` — **Date**
   - `Source` — **Select** (crear valor `landing`)
4. Compartir la database con la integración: `…` → "Connections" → agregar.
5. Copiar **database ID** de la URL (`notion.so/<workspace>/<DATABASE_ID>?v=...` — 32 hex chars).
6. Copiar `.env.example` → `.env.local` y completar.

```bash
NOTION_TOKEN=secret_xxx
NOTION_SUBSCRIBERS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Comportamiento

- **Email inválido / faltante** → 400, no Notion call.
- **Honeypot `website` field** lleno → 400, no Notion call.
- **Email ya existe** → 200 `{ok:true, duplicate:true}`, no crea duplicado.
- **Email nuevo** → crea row con `Date = now`, `Source = landing`.
- **Notion timeout (5s)** → 504.
- **Notion error / token inválido** → 500, error loggeado server-side, sin filtrar el token al cliente.

### Test rápido

```bash
pnpm dev
curl -X POST localhost:3000/api/subscribe \
  -H 'content-type: application/json' \
  -d '{"email":"test@ainta.community","name":"Test","website":""}'
# → {"ok":true}
```

## Pendiente (v1)

- [ ] Reemplazar links placeholder de Telegram/Discord
- [ ] Cargar fotos de miembros fundadores
- [ ] Eventos reales cargados (mín. 2)
- [ ] Recursos curados (mín. 10)

## Pendiente (v2)

- CMS (Notion o Sanity) para eventos/recursos
- Filtros + búsqueda en `/eventos` y `/recursos`
- Auth magic link + perfil de miembro + directorio opt-in
