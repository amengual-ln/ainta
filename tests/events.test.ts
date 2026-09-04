import test from "node:test";
import assert from "node:assert/strict";
import {
  getEventDateParts,
  groupEventsByMonth,
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
