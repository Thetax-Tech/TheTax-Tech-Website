"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Secondary image cross-faded in when the card (the nearest `.group`) is hovered.
 * Nothing is downloaded or painted until the first hover, and never on touch devices.
 */
export function HoverImage({ src, sizes, unoptimized }: { src: string; sizes: string; unoptimized: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const card = ref.current?.closest(".group");
    if (!card || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const on = () => setShow(true);
    card.addEventListener("pointerenter", on, { once: true });
    card.addEventListener("focusin", on, { once: true });
    return () => {
      card.removeEventListener("pointerenter", on);
      card.removeEventListener("focusin", on);
    };
  }, []);

  if (!show) return <span ref={ref} hidden />;
  return (
    <Image
      src={src}
      alt=""
      aria-hidden
      fill
      sizes={sizes}
      unoptimized={unoptimized}
      className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-within:opacity-100"
    />
  );
}
