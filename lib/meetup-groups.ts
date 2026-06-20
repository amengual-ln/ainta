export const MEETUP_GROUPS = [
  { slug: "aws-security-usergroup-argentina", name: "AWS Security UserGroup Argentina" },
  { slug: "aws-women-in-cloud-buenos-aires-meetup", name: "AWS Women in Cloud Buenos Aires" },
  { slug: "sysarmy", name: "Sysarmy" },
] as const;

export type MeetupGroupSlug = (typeof MEETUP_GROUPS)[number]["slug"];
