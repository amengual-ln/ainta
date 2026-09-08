import test from "node:test";
import assert from "node:assert/strict";
import {
  getEventDateParts,
  getEventStoryRange,
  groupEventsByMonth,
  selectStoryEvents,
  sortEventsByStart,
} from "../lib/events.ts";

test("preserva una fecha sin hora como fecha local literal", () => {
  assert.deepEqual(getEventDateParts("2026-08-31"), {
    day: "31",
    month: "Ago",
    year: "2026",
    time: null,
    monthKey: "2026-08",
    monthLabel: "Agosto 2026",
  });
});

test("mantiene la hora de un timestamp con offset argentino", () => {
  assert.equal(getEventDateParts("2026-09-05T18:30:00-03:00")?.time, "18:30");
});

test("convierte UTC a Buenos Aires", () => {
  const parts = getEventDateParts("2026-09-05T02:00:00Z");
  assert.equal(parts?.day, "04");
  assert.equal(parts?.time, "23:00");
});

test("ordena y agrupa eventos cronológicamente", () => {
  const events = [
    { id: "oct", startAt: "2026-10-01" },
    { id: "late-aug", startAt: "2026-08-31T20:00:00-03:00" },
    { id: "early-aug", startAt: "2026-08-27" },
    { id: "sep", startAt: "2026-09-10T18:00:00-03:00" },
  ];

  assert.deepEqual(sortEventsByStart(events).map((event) => event.id), [
    "early-aug",
    "late-aug",
    "sep",
    "oct",
  ]);
  assert.deepEqual(
    groupEventsByMonth(events).map((group) => ({
      key: group.key,
      ids: group.events.map((event) => event.id),
    })),
    [
      { key: "2026-08", ids: ["early-aug", "late-aug"] },
      { key: "2026-09", ids: ["sep"] },
      { key: "2026-10", ids: ["oct"] },
    ],
  );
});

test("calcula semana hasta domingo en Buenos Aires", () => {
  assert.deepEqual(getEventStoryRange("week", new Date("2026-09-07T15:00:00Z")), {
    start: "2026-09-07",
    end: "2026-09-13",
    title: "Eventos de la semana",
    label: "7 al 13 de septiembre de 2026",
    fileStamp: "2026-09-07",
  });
  assert.equal(
    getEventStoryRange("week", new Date("2026-09-13T15:00:00Z")).end,
    "2026-09-13",
  );
});

test("calcula fin de mes usando el día local argentino", () => {
  const range = getEventStoryRange("month", new Date("2026-10-01T02:00:00Z"));
  assert.equal(range.start, "2026-09-30");
  assert.equal(range.end, "2026-09-30");
  assert.equal(range.title, "Eventos de septiembre");
  assert.equal(range.fileStamp, "2026-09");

  const yearEnd = getEventStoryRange("month", new Date("2026-12-31T15:00:00Z"));
  assert.equal(yearEnd.end, "2026-12-31");
});

test("filtra el rango, limita y cuenta eventos restantes", () => {
  const events = Array.from({ length: 9 }, (_, index) => ({
    id: index + 1,
    startAt: `2026-09-${String(index + 4).padStart(2, "0")}`,
    extraTags: [],
  }));
  const result = selectStoryEvents(
    events,
    { start: "2026-09-05", end: "2026-09-12" },
    6,
  );

  assert.deepEqual(result.events.map((event) => event.id), [2, 3, 4, 5, 6, 7]);
  assert.equal(result.remaining, 2);
});

test("prioriza destacados y devuelve la selección en orden cronológico", () => {
  const events = Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    startAt: `2026-09-${String(index + 1).padStart(2, "0")}`,
    extraTags: index >= 8 ? [index === 8 ? "DESTACADO" : "Destacado"] : [],
  }));
  const result = selectStoryEvents(
    events,
    { start: "2026-09-01", end: "2026-09-30" },
    3,
    true,
  );

  assert.deepEqual(result.events.map((event) => event.id), [1, 9, 10]);
  assert.equal(result.remaining, 7);
});
