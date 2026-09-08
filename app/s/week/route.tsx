import { createEventStory } from "../story";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  return createEventStory("week");
}
