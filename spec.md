# Spärck — Product Spec

## Visión general

Spärck es una comunidad abierta de estudiantes y graduados de carreras de Inteligencia Artificial. Nace como respuesta a un problema concreto: la baja calidad pedagógica de muchas carreras de IA, donde los contenidos fundamentales (programación, gestión de proyectos, bases teóricas reales) no se enseñan bien o directamente no se enseñan.

El sitio web es el hub central de la comunidad: punto de entrada, directorio de eventos y recursos, y puerta a los canales de comunicación (Telegram, Discord, newsletter).

---

## Nombre y posicionamiento

**Nombre:** Spärck  
**Tagline:** *Aprender IA entre quienes la viven de verdad*  
**Descripción corta:** Comunidad abierta de estudiantes y graduados de IA — sin fronteras geográficas, sin jerarquías, sin humo.

**Lo que NO es:**
- Una institución académica
- Un foro de discusión genérico
- Un servicio de empleo
- Una empresa

**Lo que SÍ es:**
- Un colectivo horizontal de estudiantes que se enseñan entre sí
- Un radar de eventos y oportunidades del ecosistema IA
- Una biblioteca de recursos curados y reales
- Una red de pares para armar grupos de estudio y proyectos

---

## Audiencia

**Primaria:** Estudiantes activos de carreras de IA, datos, sistemas o afines — en cualquier país de habla hispana (y potencialmente anglófona a futuro).

**Secundaria:** Graduados recientes que quieren seguir conectados a la comunidad y contribuir con talleres, charlas o mentoría.

**No es para:** Profesionales senior buscando networking corporativo, ni empresas buscando contratar directamente.

---

## Páginas y secciones (v1)

### `/` — Landing page

1. **Nav** — Logo Spärck + links de sección + CTA "Unirse →". Transparente, integrado al hero sin borde ni fondo.

2. **Hero** — Eyebrow label, título grande, descripción, dos CTAs (primario: unirse / secundario: ver eventos), fila de stats (miembros, talleres, recursos).

3. **Pilares** — Tres cards que explican los ejes de la comunidad:
   - Aprendizaje real (talleres propios)
   - Radar de eventos (curación externa)
   - Red de pares (networking entre estudiantes)

4. **Próximos eventos** — Lista de los próximos 4–5 eventos con fecha, título, metadata (online/presencial, hora, speaker) y tag de tipo (Taller / Charla / Externo).

5. **Recursos** — Grid 2×2 de categorías de la biblioteca:
   - Programación para IA (fundamentos)
   - ML sin misterios
   - Gestión y deployment
   - Grabaciones de talleres

6. **Sumate a Spärck** — Card de cierre con tres botones de canal: Telegram, Discord, Newsletter.

7. **Footer** — Logo + copyright.

---

### `/eventos` — Agenda completa (v2)

- Listado completo con filtros por tipo (Taller / Charla / Externo / Hackathon)
- Cada evento con: fecha, título, descripción, speaker, modalidad, link de inscripción
- Posibilidad de agregar al calendario

### `/recursos` — Biblioteca (v2)

- Categorías expandidas con recursos individuales
- Cada recurso con: título, descripción, tipo (video / artículo / notebook / paper), nivel (básico / intermedio / avanzado), link externo
- Filtros por categoría y nivel

### `/talleres` — Talleres propios (v2)

- Próximos talleres con inscripción
- Talleres pasados con grabación y materiales

---

## Funcionalidades v1 (MVP)

- [ ] Landing page estática con todas las secciones
- [ ] Links funcionales a Telegram y Discord
- [ ] Formulario de suscripción a newsletter (Resend / Mailchimp / Buttondown)
- [ ] SEO básico (meta tags, OG tags, favicon)
- [ ] Responsive mobile
- [ ] Deploy en Vercel (dominio: `sparck.com.ar`)

## Funcionalidades v2

- [ ] CMS para eventos y recursos (Notion API o Sanity)
- [ ] Página `/eventos` con filtros
- [ ] Página `/recursos` con filtros y búsqueda
- [ ] Autenticación simple para miembros (magic link)
- [ ] Perfil de miembro (carrera, país, intereses)
- [ ] Directorio de miembros (opt-in)

## Funcionalidades v3

- [ ] Inscripción a talleres con recordatorio por email
- [ ] Sistema de propuesta de talleres (formulario → revisión → publicación)
- [ ] Integración con canal de Telegram para anuncios automáticos de nuevos eventos

---

## Stack sugerido

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Estilos:** Tailwind CSS
- **Tipografías:** Space Grotesk + Inter (Google Fonts)
- **Animaciones:** CSS nativo para orbs de fondo; Framer Motion para transiciones de página y scroll reveal

### CMS (v2)
- **Opción A:** Notion como base de datos + Notion API (cero costo, fácil de mantener por no-devs)
- **Opción B:** Sanity (más control, mejor DX)

### Infraestructura
- **Deploy:** Vercel (free tier suficiente para v1)
- **Dominio:** `sparck.com.ar`
- **Newsletter:** Resend (gratuito hasta 3k emails/mes) o Buttondown
- **Analytics:** Vercel Analytics o Plausible (privacy-first)

### Comunicación
- **Telegram:** Canal de anuncios (solo admins) + grupo de discusión general
- **Discord:** Servidor con canales temáticos (general, proyectos, recursos, ofertas, off-topic)

---

## Métricas de éxito (v1)

- 50 miembros en Telegram en el primer mes
- 3 talleres organizados en los primeros 90 días
- 20 recursos subidos a la biblioteca antes del lanzamiento
- Tasa de rebote < 60% en la landing

---

## Contenido mínimo para lanzar

- Texto definitivo del hero y descripción de los tres pilares
- Al menos 2 eventos reales cargados
- Al menos 10 recursos curados por categoría
- Links reales de Telegram y Discord
- Foto o avatar de al menos 3 miembros fundadores (para dar cara a la comunidad)
