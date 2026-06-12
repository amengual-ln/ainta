export type EventType = "taller" | "charla" | "externo" | "hackathon";

export interface EventItem {
  day: string;
  month: string;
  title: string;
  meta: string;
  type: EventType;
  url?: string;
}

export const events: EventItem[] = [
  {
    day: "18",
    month: "Jun",
    title: "Taller: Python para IA desde cero",
    meta: "Online · 19:00 hs · Con Martina R.",
    type: "taller",
    url: "#",
  },
  {
    day: "24",
    month: "Jun",
    title: "Charla: De la carrera al mundo real",
    meta: "Presencial · Buenos Aires · 18:30 hs",
    type: "charla",
    url: "#",
  },
  {
    day: "02",
    month: "Jul",
    title: "Hackathon LatAm AI 2026",
    meta: "Externo · Online · 72 hs",
    type: "hackathon",
    url: "#",
  },
  {
    day: "10",
    month: "Jul",
    title: "Taller: Gestión ágil de proyectos de datos",
    meta: "Online · 19:00 hs · Con Federico G.",
    type: "taller",
    url: "#",
  },
  {
    day: "17",
    month: "Jul",
    title: "Charla: Cómo leer un paper sin volverse loco",
    meta: "Online · 20:00 hs · Con Lucía M.",
    type: "charla",
    url: "#",
  },
];
