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
- **Email ya existe** → 200 `{ok:true, duplicate:true}`, no crea duplicado, no manda email.
- **Email nuevo** → crea row con `Date = now`, `Source = landing`, manda welcome email vía Resend.
- **Notion timeout (5s)** → 504.
- **Notion error / token inválido** → 500, error loggeado server-side, sin filtrar el token al cliente.
- **Resend falla** → la suscripción sigue exitosa (`{ok:true, emailQueued:false}`), se loggea server-side. Notion es la fuente de verdad.

### Welcome email (Resend)

Después de crear la fila en Notion, se envía un mail de bienvenida vía [Resend](https://resend.com).

**Setup (one-time):**

1. Crear cuenta en Resend → **API Keys** → crear key con permiso `Sending access` → copiar.
2. **Domains** → agregar el dominio desde el que se va a enviar (ej: `sparck.com.ar`) y configurar los DNS records que pide Resend.
3. Copiar `.env.example` → `.env.local` y completar:
   ```bash
   RESEND_API_KEY=re_xxxxxxxxx
   RESEND_FROM=hola@sparck.com.ar   # debe estar en un dominio verificado en Resend
   SITE_URL=https://sparck.com.ar   # se usa para el logo y el CTA del mail
   ```

Si las env vars faltan, la suscripción sigue funcionando (Notion es la fuente de verdad); el cliente recibe `emailQueued: false` y muestra un mensaje más neutro.

El template del mail (`lib/resend.ts`) está maquetado con `<table>` (sin flexbox/grid), todos los estilos inline, sin web fonts — usa el system stack. El logo es el `favicon.png` oficial (fondo transparente, blend limpio sobre el `#080B10` del mail). El copy y los colores siguen `design.md`: emerald curada `#34A88B`, eyebrow mono uppercase, card `#0D1117` con border `#1F2630` y radius 16px.

### Test rápido

```bash
pnpm dev
curl -X POST localhost:3000/api/subscribe \
  -H 'content-type: application/json' \
  -d '{"email":"test@sparck.com.ar","name":"Test","website":""}'
# → {"ok":true,"emailQueued":true}
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

## Noticias (Notion + cron-job.org)

Mismo patrón que Eventos: **una sola database** en Notion. Un cron diario
scrapea 3 fuentes de IA y crea filas con `Status = Nuevo`; el curador revisa
la tabla y cambia `Status` a `Publicado` para mostrar la noticia en la web.

### Flujo

```
cron-job.org (diario) ──→ POST /api/news/discover
                              │
                              ├─ arXiv (papers cs.AI/cs.LG/cs.CL, API Atom)
                              ├─ Hacker News (Algolia search API, filtro AI)
                              └─ Blogs (RSS: OpenAI, Google AI, MIT Tech Review)
                                       │
                                       ▼
                              Notion · News
                              (Status = Nuevo)
                                       │
                              Curador revisa y cambia Status → Publicado
                                       │
                                       ▼
                              components/News.tsx (home, top 5)
                              app/noticias/page.tsx (listado completo)
                              lee la misma DB filtrando Status = Publicado
```

### Schema de la database (única)

| Property | Type | Notes |
|---|---|---|
| `Título` | Title | requerido |
| `URL` | URL | requerido, dedupe key |
| `Summary` | Rich text | resumen/snippet de la fuente original |
| `Source` | Select | `arXiv` / `Hacker News` / `OpenAI` / `Google AI` / `MIT Tech Review` |
| `PublishedAt` | Date | requerido, se usa para ordenar y mostrar día/mes |
| `Tags` | Multi-select | `Papers` / `Industria` / `Blog` |
| `Status` | Status | `Nuevo` → `Publicado` |

### Setup (one-time)

1. Crear **una sola database** en Notion con el schema de arriba.
2. En `Status` (tipo Status) crear los 2 valores: `Nuevo`, `Publicado`.
3. Compartir la database con la integración existente (`Spärck Subscribers`
   o una nueva, misma que usa `NOTION_TOKEN`).
4. Copiar el database ID y agregarlo a `.env.local`:

```bash
NOTION_NEWS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Cron-job.org

- Method: `POST`
- URL: `https://<domain>/api/news/discover`
- Schedule: diario
- Body: (vacío)
- Auth: (ninguna)

### Test rápido

```bash
pnpm dev
curl -X POST localhost:3000/api/news/discover
# → { ok, sources: { arxiv, hackernews, blogs }, scraped, deduped, created, discarded, errors }
```

Para mostrar una noticia en la web: en Notion cambiar la fila a
`Status = Publicado`. Aparece en la home (top 5) y en `/noticias` en el
próximo revalidate (≤ 1h).

## Pendiente (v1)

- [ ] Reemplazar links placeholder de Telegram/Discord
- [ ] Cargar fotos de miembros fundadores
- [ ] Recursos curados (mín. 10)

## Pendiente (v2)

- CMS (Notion o Sanity) para eventos/recursos
- Filtros + búsqueda en `/eventos` y `/recursos`
- Auth magic link + perfil de miembro + directorio opt-in
