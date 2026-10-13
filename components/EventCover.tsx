"use client";

import { useState } from "react";
import Image from "next/image";

export default function EventCover({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <span className="next-event-cover">
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 599px) calc(100vw - 48px), (min-width: 1024px) 220px, 40vw"
        className="next-event-cover-image"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
