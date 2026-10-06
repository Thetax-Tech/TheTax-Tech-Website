import { renderOgImage, OG_SIZE } from "@/lib/og";

export const alt = "Theta X Tech — AI Automation, BPO & Web Development Company in Karachi";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({ title: "AI automation, BPO & digital solutions that move your business forward.", eyebrow: "Theta X Tech · Karachi" });
}
