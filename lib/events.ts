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
    title: "Taller: Git Workflows en ambito profesional",
    meta: "Online · 19:00 hs",
    type: "taller",
    url: "#",
  },
  {
    day: "24",
    month: "Jun",
    title: "Charla: El estado de la IA y lo que se viene",
    meta: "Presencial · ISFT · 19:30 hs · Con Esteban Corio",
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
    title: "Charla: Gestión ágil de proyectos de datos",
    meta: "Online · 19:00 hs · Con Javier Perez",
    type: "charla",
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
