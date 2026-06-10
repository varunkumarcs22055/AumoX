"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Circular leadership avatar.
 * Shows the headshot when available; if no photo is set (or it fails to load)
 * it falls back to the gold initials disc — so the page never shows a broken
 * image while photos are still being added.
 */
export default function TeamAvatar({
  name,
  initials,
  photo,
  size = 80,
}: {
  name: string;
  initials: string;
  photo?: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(photo) && !failed;

  return (
    <div
      className="relative shrink-0 grid place-items-center overflow-hidden rounded-full bg-gold-gradient text-black font-display font-medium ring-1 ring-gold-400/30"
      style={{ height: size, width: size, fontSize: Math.round(size * 0.32) }}
    >
      {showPhoto ? (
        <Image
          src={photo as string}
          alt={name}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
