export interface RawEvent {
  source: "luma" | "eventbrite" | "meetup";
  sourceId: string;
  title: string;
  url: string;
  startAt: string;
  timezone: string;
  modality: "Presencial" | "Online" | "Híbrido";
  location: string;
  cost: "Gratis" | "Pago";
  tags: string[];
}

export interface NormalizedEvent {
  source: "luma" | "eventbrite" | "meetup";
  title: string;
  url: string;
  startAt: Date;
  modality: "Presencial" | "Online" | "Híbrido";
  location: string;
  cost: "Gratis" | "Pago";
  tags: string[];
}

export type RejectReason =
  | "missing_field"
  | "invalid_start_at"
  | "normalize_rejected"
  | "event_page_unfetched"
  | "no_jsonld_event"
  | "jsonld_missing_start_date";

export interface RejectedEvent {
  source: "luma" | "eventbrite" | "meetup";
  title: string;
  url: string;
  startAt: string;
  reason: RejectReason;
}

export interface SourceFetchResult {
  events: NormalizedEvent[];
  rejected: RejectedEvent[];
  errors: string[];
}

export interface MeetupEventJsonLd {
  startDate?: string;
  endDate?: string;
  eventAttendanceMode?: string;
  location?: {
    name?: string;
    address?: {
      addressLocality?: string;
      addressRegion?: string;
      addressCountry?: string;
    };
  };
}

const ATTENDANCE_MODE_MAP: Record<string, RawEvent["modality"]> = {
  "https://schema.org/OfflineEventAttendanceMode": "Presencial",
  "https://schema.org/OnlineEventAttendanceMode": "Online",
  "https://schema.org/MixedEventAttendanceMode": "Híbrido",
};

export function parseMeetupEventJsonLd(
  html: string
): MeetupEventJsonLd | null {
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const raw = match[1].trim();
    try {
      const parsed = JSON.parse(raw);
      const candidates: unknown[] = Array.isArray(parsed)
        ? parsed
        : parsed["@graph"]
        ? (parsed["@graph"] as unknown[])
        : [parsed];
      for (const c of candidates) {
        if (
          c &&
          typeof c === "object" &&
          (c as { "@type"?: unknown })["@type"] === "Event"
        ) {
          return c as MeetupEventJsonLd;
        }
      }
    } catch {
      // ignore malformed JSON-LD blocks and keep scanning
    }
  }
  return null;
}

export function modalityFromAttendanceMode(
  mode: string | undefined
): RawEvent["modality"] | null {
  if (!mode) return null;
  return ATTENDANCE_MODE_MAP[mode] ?? null;
}

export function locationFromJsonLd(ld: MeetupEventJsonLd): string {
  const name = ld.location?.name?.trim();
  const locality = ld.location?.address?.addressLocality?.trim();
  if (name && locality && name.toLowerCase() !== locality.toLowerCase()) {
    return `${name} · ${locality}`;
  }
  return name ?? locality ?? "";
}

const LUMA_LOCATION_TYPES: Record<string, RawEvent["modality"]> = {
  offline: "Presencial",
  online: "Online",
  hybrid: "Híbrido",
};

function inferModalityFromTitle(title: string): RawEvent["modality"] {
  const t = title.toLowerCase();
  if (t.includes("online") || t.includes("virtual") || t.includes("remoto")) return "Online";
  if (t.includes("híbrido") || t.includes("hibrido") || t.includes("hybrid")) return "Híbrido";
  return "Presencial";
}

function inferLocationFromTitle(title: string): string {
  const m = title.match(/·\s*([^·]+?)\s*$/);
  if (m) return m[1].trim();
  return "";
}

export function normalize(raw: RawEvent): NormalizedEvent | null {
  if (!raw.title || !raw.url || !raw.startAt) return null;

  const startAt = new Date(raw.startAt);
  if (Number.isNaN(startAt.getTime())) return null;

  let modality = raw.modality;
  let location = raw.location;

  if (!modality || !location) {
    const inferred = inferModalityFromTitle(raw.title);
    if (!modality) modality = inferred;
    if (!location) location = inferLocationFromTitle(raw.title);
  }

  if (modality === "Online" && !location) {
    location = "Online";
  }

  return {
    source: raw.source,
    title: raw.title.trim(),
    url: raw.url.trim(),
    startAt,
    modality,
    location: location.trim(),
    cost: raw.cost,
    tags: raw.tags,
  };
}

export function lumaToRaw(event: {
  api_id?: string;
  name?: string;
  url?: string;
  start_at?: string;
  timezone?: string;
  location_type?: string;
}): RawEvent | null {
  if (!event.name || !event.url || !event.start_at) return null;
  return {
    source: "luma",
    sourceId: event.api_id ?? event.url,
    title: event.name,
    url: event.url.startsWith("http") ? event.url : `https://lu.ma/${event.url}`,
    startAt: event.start_at,
    timezone: event.timezone ?? "America/Argentina/Buenos_Aires",
    modality: LUMA_LOCATION_TYPES[event.location_type ?? "offline"] ?? "Presencial",
    location: "",
    cost: "Gratis",
    tags: [],
  };
}

export function eventbriteToRaw(event: {
  id?: string | number;
  name?: string;
  url?: string;
  start_date?: string;
  start_time?: string;
  timezone?: string;
  is_online_event?: boolean;
  primary_venue?: { name?: string; address?: { localized_address_display?: string } };
  is_free?: boolean | null;
}): RawEvent | null {
  if (!event.id || !event.name || !event.url || !event.start_date) return null;
  const startAt = event.start_time
    ? `${event.start_date}T${event.start_time}:00`
    : `${event.start_date}T00:00:00`;
  const modality: RawEvent["modality"] = event.is_online_event
    ? event.primary_venue
      ? "Híbrido"
      : "Online"
    : "Presencial";
  const location =
    modality === "Online"
      ? "Online vía Eventbrite"
      : event.primary_venue?.address?.localized_address_display ?? event.primary_venue?.name ?? "";
  return {
    source: "eventbrite",
    sourceId: String(event.id),
    title: event.name,
    url: event.url,
    startAt,
    timezone: event.timezone ?? "America/Argentina/Buenos_Aires",
    modality,
    location,
    cost: event.is_free === true ? "Gratis" : "Pago",
    tags: [],
  };
}

export function meetupToRaw(item: {
  title?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  contentSnippet?: string;
  "dc:creator"?: string;
}): RawEvent | null {
  if (!item.title || !item.link || !item.pubDate) return null;
  const startAt = new Date(item.pubDate);
  if (Number.isNaN(startAt.getTime())) return null;
  return {
    source: "meetup",
    sourceId: item.guid ?? item.link,
    title: item.title,
    url: item.link,
    startAt: startAt.toISOString(),
    timezone: "America/Argentina/Buenos_Aires",
    modality: "Presencial",
    location: item["dc:creator"] ?? "",
    cost: "Gratis",
    tags: [],
  };
}
