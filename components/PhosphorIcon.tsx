"use client";

import {
  GraduationCap,
  CalendarBlank,
  UsersThree,
  Compass,
  Broadcast,
  ArrowDown,
  ArrowUpRight,
  MapPin,
  Certificate,
  List,
  InstagramLogo,
  LinkedinLogo,
  WhatsappLogo,
} from "@phosphor-icons/react";

type IconComponent = typeof GraduationCap;

const iconRegistry = {
  GraduationCap,
  CalendarBlank,
  UsersThree,
  Compass,
  Broadcast,
  ArrowDown,
  ArrowUpRight,
  MapPin,
  Certificate,
  List,
  InstagramLogo,
  LinkedinLogo,
  WhatsappLogo,
} satisfies Record<string, IconComponent>;

interface PhosphorIconProps {
  name: keyof typeof iconRegistry;
  size?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  color?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

export default function PhosphorIcon({
  name,
  size = 20,
  weight = "regular",
  color,
  ...ariaProps
}: PhosphorIconProps) {
  const IconComponent = iconRegistry[name];
  return <IconComponent size={size} weight={weight} color={color} {...ariaProps} />;
}
