export const EVENT_TIME_ZONE = "America/Argentina/Buenos_Aires";

export interface EventDateParts {
  day: string;
  month: string;
  year: string;
  time: string | null;
  monthKey: string;
  monthLabel: string;
}

export type EventStoryPeriod = "week" | "month";

export interface EventStoryRange {
  start: string;
  end: string;
  title: string;
  label: string;
  fileStamp: string;
}

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
] as const;
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function partsInBuenosAires(date: Date): Record<string, string> {
  return Object.fromEntries(
    new Intl.DateTimeFormat("es-AR", {
      timeZone: EVENT_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}

export function getEventDateParts(startAt: string): EventDateParts | null {
  const literal = DATE_ONLY.exec(startAt);
  let year: string;
  let monthNumber: string;
  let day: string;
  let time: string | null;

  if (literal) {
    [, year, monthNumber, day] = literal;
    time = null;
  } else {
    const date = new Date(startAt);
    if (Number.isNaN(date.getTime())) return null;
    const parts = partsInBuenosAires(date);
    year = parts.year;
    monthNumber = parts.month;
    day = parts.day;
    time = `${parts.hour}:${parts.minute}`;
  }

  const monthName = MONTHS[Number(monthNumber) - 1];
  if (!monthName) return null;

  return {
    day,
    month: capitalize(monthName.slice(0, 3)),
    year,
    time,
    monthKey: `${year}-${monthNumber}`,
    monthLabel: `${capitalize(monthName)} ${year}`,
  };
}

export function todayInBuenosAires(now = new Date()): string {
  const parts = partsInBuenosAires(now);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function literalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function dateLiteral(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatStoryRange(start: string, end: string): string {
  const from = literalDate(start);
  const through = literalDate(end);
  const startDay = from.getUTCDate();
  const endDay = through.getUTCDate();
  const startMonth = MONTHS[from.getUTCMonth()];
  const endMonth = MONTHS[through.getUTCMonth()];
  const startYear = from.getUTCFullYear();
  const endYear = through.getUTCFullYear();

  if (startYear !== endYear) {
    return `${startDay} de ${startMonth} de ${startYear} al ${endDay} de ${endMonth} de ${endYear}`;
  }
  if (startMonth !== endMonth) {
    return `${startDay} de ${startMonth} al ${endDay} de ${endMonth} de ${endYear}`;
  }
  if (startDay === endDay) return `${startDay} de ${startMonth} de ${startYear}`;
  return `${startDay} al ${endDay} de ${endMonth} de ${endYear}`;
}

export function getEventStoryRange(
  period: EventStoryPeriod,
  now = new Date(),
): EventStoryRange {
  const start = todayInBuenosAires(now);
  const startDate = literalDate(start);
  let endDate: Date;

  if (period === "week") {
    endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + (7 - startDate.getUTCDay()) % 7);
  } else {
    endDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, 0));
  }

  const end = dateLiteral(endDate);
  const month = MONTHS[startDate.getUTCMonth()];
  return {
    start,
    end,
    title: period === "week" ? "Eventos de la semana" : `Eventos de ${month}`,
    label: formatStoryRange(start, end),
    fileStamp: period === "week" ? start : start.slice(0, 7),
  };
}

function localDateLiteral(startAt: string): string | null {
  const parts = getEventDateParts(startAt);
  if (!parts) return null;
  return `${parts.monthKey}-${parts.day}`;
}

export function isFeaturedEvent(event: { extraTags?: string[] }): boolean {
  return event.extraTags?.some((tag) => tag.trim().toLowerCase() === "destacado") ?? false;
}

export function selectStoryEvents<T extends { startAt: string; extraTags?: string[] }>(
  events: T[],
  range: Pick<EventStoryRange, "start" | "end">,
  limit: number,
  prioritizeFeatured = false,
): { events: T[]; remaining: number } {
  const eligible = sortEventsByStart(events).filter((event) => {
    const date = localDateLiteral(event.startAt);
    return date !== null && date >= range.start && date <= range.end;
  });
  const candidates = prioritizeFeatured
    ? [...eligible.filter(isFeaturedEvent), ...eligible.filter((event) => !isFeaturedEvent(event))]
    : eligible;
  const selected = sortEventsByStart(candidates.slice(0, limit));

  return { events: selected, remaining: eligible.length - selected.length };
}

function eventTimestamp(startAt: string): number {
  return Date.parse(DATE_ONLY.test(startAt) ? `${startAt}T00:00:00-03:00` : startAt);
}

export function sortEventsByStart<T extends { startAt: string }>(events: T[]): T[] {
  return [...events].sort(
    (a, b) => eventTimestamp(a.startAt) - eventTimestamp(b.startAt),
  );
}

export interface EventMonthGroup<T> {
  key: string;
  label: string;
  events: T[];
}

export function groupEventsByMonth<T extends { startAt: string }>(
  events: T[],
): EventMonthGroup<T>[] {
  const groups = new Map<string, EventMonthGroup<T>>();

  for (const event of sortEventsByStart(events)) {
    const date = getEventDateParts(event.startAt);
    if (!date) continue;
    const group = groups.get(date.monthKey);
    if (group) group.events.push(event);
    else groups.set(date.monthKey, { key: date.monthKey, label: date.monthLabel, events: [event] });
  }

  return [...groups.values()];
}
