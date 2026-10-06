import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

let iconCache: string | null = null;
async function iconDataUrl() {
  if (!iconCache) {
    const buf = await readFile(join(/* turbopackIgnore: true */ process.cwd(), "public/brand/logo-icon-white.png"));
    iconCache = `data:image/png;base64,${buf.toString("base64")}`;
  }
  return iconCache;
}

/** Branded 1200x630 social card used for the site default and per-article images. */
export async function renderOgImage({ title, eyebrow, footer = "thetaxtech.com.pk" }: { title: string; eyebrow?: string; footer?: string }) {
  const icon = await iconDataUrl();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(70% 90% at 15% 10%, rgba(247,148,29,0.45), transparent 60%), radial-gradient(60% 80% at 100% 100%, rgba(255,122,26,0.25), transparent 60%), #07080b",
          color: "#f5f5f4",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon} width={76} height={70} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: 4 }}>THETA X TECH</span>
            <span style={{ fontSize: 18, color: "#f7941d", letterSpacing: 6 }}>INNOVATION IN EVERY STEP</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {eyebrow && <span style={{ fontSize: 24, color: "#f7941d", textTransform: "uppercase", letterSpacing: 4 }}>{eyebrow}</span>}
          <span style={{ fontSize: title.length > 60 ? 54 : 66, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000 }}>{title}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#a8a8b3" }}>
          <span>{footer}</span>
          <span>Karachi, Pakistan</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
