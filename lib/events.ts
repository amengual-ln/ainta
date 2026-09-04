export const EVENT_TIME_ZONE = "America/Argentina/Buenos_Aires";

export interface EventDateParts {
  day: string;
  month: string;
  year: string;
  time: string | null;
  monthKey: string;
  monthLabel: string;
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
