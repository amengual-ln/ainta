# Spärck — Web

Landing + hub de la comunidad Spärck (estudiantes y graduados de IA).

Spec: `../spec.md` · Design system: `../design.md`

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
  sources/          ← fetchers de eventos (Luma, Eventbrite, Meetup, Notion)
  meetup-groups.ts  ← slugs de grupos Meetup curados
  normalize.ts      ← shape unificado de eventos crudos
  sparck-events.ts  ← eventos propios de Spärck (vacío por ahora)
  resources.ts      ← data estática de categorías de recursos
```

## Newsletter (suscripciones → Notion DB)

El form de la landing postea a `POST /api/subscribe` → valida → upsert en una database de Notion.

### Setup (one-time)

1. Crear integración: <https://www.notion.so/profile/integrations> → "Spärck Subscribers" → copiar **Internal Integration Token**.
2. Crear una page "Spärck — Subscribers" con database full-page.
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
  -d '{"email":"test@sparck.com.ar","name":"Test","website":""}'
# → {"ok":true}
```

## Eventos (Notion + cron-job.org)

La landing y el discover pipeline usan **una sola database** en Notion.
Un cron diario scrapea 3 fuentes externas y crea filas con `Status = Nuevo`; el curador
revisa la tabla y cambia `Status` a `curado` para mostrar el evento en la web.

### Flujo

```
cron-job.org (09:00 ART) ──→ POST /api/events/discover
                              │
                              ├─ Luma (scrape __NEXT_DATA__)
                              ├─ Eventbrite (scrape __SERVER_DATA__)
                              └─ Meetup RSS + JSON-LD por evento
                                       │
                                       ▼
                              Notion · Events
                              (Status = Nuevo, Encontrado por = "Auto · {source}")
                                       │
                              Curador revisa y cambia Status → curado
                                       │
                                       ▼
                              components/Events.tsx (async, revalidate=3600)
                              lee la misma DB filtrando Status = curado
                              y Fecha >= hoy, muestra 2 Spärck + 4 externos
```

### Schema de la database (única)

| Property | Type | Notes |
|---|---|---|
| `Título` | Title | requerido |
| `Fecha` | Date | requerido, filtra `>= hoy` en la web |
| `Modalidad` | Select | `Presencial` / `Online` / `Híbrido` |
| `Lugar` | Rich text | |
| `Link` | URL | requerido, dedupe key |
| `Fuente` | Select | `Luma` / `Eventbrite` / `Meetup` / `Spärck` |
| `Costo` | Select | `Gratis` / `Pago` |
| `Tags` | Multi-select | `Taller` / `Workshop` / `Charla` / `Meetup` / `Networking` / `Hackathon` |
| `Encontrado por` | Rich text | ej: `Auto · Luma` |
| `Status` | Status | `Nuevo` → `curado` |
| `Notas` | Rich text | opcional |

### Setup (one-time)

1. Crear **una sola database** en Notion con el schema de arriba.
2. En el select `Fuente` agregar el valor `Spärck` (para eventos propios).
3. En `Status` (tipo Status) crear los 2 valores: `Nuevo`, `curado`.
4. Compartir la database con la integración.
5. Copiar `.env.example` → `.env.local` y completar las 4 vars.

```bash
NOTION_TOKEN=secret_xxx
NOTION_SUBSCRIBERS_DB_ID=...
NOTION_DISCOVERED_EVENTS_DB_ID=...
EVENTBRITE_API_TOKEN=...
```

### Cron-job.org

- Method: `POST`
- URL: `https://<domain>/api/events/discover`
- Schedule: diario 09:00 hora Buenos Aires
- Body: (vacío)
- Auth: (ninguna)

### Test rápido

```bash
pnpm dev
curl -X POST localhost:3000/api/events/discover
# → { ok, sources: { luma, eventbrite, meetup }, scraped, deduped, created, discarded, errors }
```

Para mostrar un evento en la web: en Notion cambiar la fila a `Status = curado`.
Aparece en la landing en el próximo revalidate (≤ 1h). Para eventos propios de Spärck:
crear la fila directo en la DB con `Fuente = Spärck`, llenar los campos y setear
`Status = curado`.

## Pendiente (v1)

- [ ] Reemplazar links placeholder de Telegram/Discord
- [ ] Cargar fotos de miembros fundadores
- [ ] Recursos curados (mín. 10)

## Pendiente (v2)

- CMS (Notion o Sanity) para eventos/recursos
- Filtros + búsqueda en `/eventos` y `/recursos`
- Auth magic link + perfil de miembro + directorio opt-in
