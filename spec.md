# Spärck | Product Spec

## Visión

Spärck es una comunidad abierta de estudiantes y aficionados de inteligencia artificial y ciencia de datos. Nació para compensar una formación técnica insuficiente con aprendizaje entre pares, eventos útiles, recursos concretos y networking.

La web presenta la comunidad, explica su origen y permite llegar rápido a eventos, recursos y formas de sumarse.

## Audiencia

La audiencia principal son estudiantes, graduados recientes y personas autodidactas de IA, datos, sistemas o áreas afines. Buscan contenido práctico, una agenda confiable y pares con intereses similares.

Spärck no es una institución académica, una bolsa de trabajo ni un foro corporativo.

## Arquitectura pública

### `/` | Comunidad

- Identidad visual original, wordmark, orbs y glitch.
- Header sticky con accesos directos a Eventos, Recursos y Sumate.
- CTA principal a `/eventos` y secundaria a `/recursos`.
- Historia y pilares de la comunidad.
- Newsletter como cierre mediante `#unirse`.

### `/eventos` | Agenda

- Eventos curados desde Notion.
- Filtro desde el comienzo del día actual en `America/Argentina/Buenos_Aires`.
- Grilla agrupada por mes: dos columnas en escritorio y una en móvil.
- Cada tarjeta muestra fecha, hora cuando existe, modalidad, ubicación, resumen y badges útiles.
- El tag `Destacado` resalta la tarjeta sin alterar el orden cronológico.
- Los eventos propios llevan badge `Spärck`.
- Los links abren la fuente externa con `noopener noreferrer`.
- ISR de una hora.

### `/recursos` | Biblioteca

Catálogo estático de recursos agrupados en:

- Fundamentos
- Modelos y LLMs
- Herramientas de IA
- Proyectos reales

Cada recurso tiene tipo, nivel, idioma y link externo. Esta iteración no incluye filtros ni búsqueda.

### `/talleres`

La ruta se conserva como placeholder, pero queda fuera del sitemap y con `noindex` hasta contar con contenido propio.

## Datos de eventos

Notion sigue siendo el CMS sin cambios de schema. La web lee filas con `Status = Curado`.

`EventItem` mantiene datos sin formatear:

- `startAt`: fecha ISO o fecha literal `YYYY-MM-DD`.
- `modality`: Presencial, Online, Híbrido o null.
- `location`: ubicación estructurada como texto.
- título, URL, fuente, resumen, notas, tags y costo.

Las fechas sin hora se preservan como literales locales. Los timestamps se convierten a Buenos Aires antes de generar día, mes, año, hora y clave mensual.

## Modelo de recursos

```ts
type ResourceCategory =
  | "fundamentos"
  | "modelos"
  | "herramientas"
  | "proyectos";

type ResourceLevel = "Básico" | "Intermedio" | "Avanzado";
type ResourceLanguage = "ES" | "EN";
type ResourceKind = "Curso" | "Guía" | "Libro" | "Práctica";

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: ResourceCategory;
  level: ResourceLevel;
  language: ResourceLanguage;
  kind: ResourceKind;
  certificate?: boolean;
  featured: boolean;
}
```

El catálogo debe mantener exactamente un destacado por categoría.

## Restricciones de esta iteración

- Sin nuevas dependencias.
- Sin auth, analytics ni detalle interno de evento.
- Sin calendario mensual, filtros, búsqueda ni CMS de recursos.
- APIs de newsletter y descubrimiento sin cambios.
- Tema oscuro, tipografías y acento emerald preservados.

## Aceptación

- `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit` y `pnpm build` pasan.
- Landing, agenda y biblioteca funcionan en desktop y móvil sin overflow horizontal.
- Header y menú móvil son utilizables con teclado.
- Los títulos animados exponen frases completas a lectores de pantalla.
- Reduced motion desactiva animaciones.
- Tarjetas móviles de evento rondan un máximo de 220 px.
- Empty state de eventos y estados del newsletter siguen funcionando.
