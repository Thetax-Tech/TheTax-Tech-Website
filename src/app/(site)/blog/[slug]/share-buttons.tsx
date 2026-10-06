"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { FacebookIcon, LinkedInIcon, WhatsAppIcon, XIcon } from "@/components/ui/brand-icons";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: LinkedInIcon },
    { label: "Share on X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, Icon: XIcon },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: FacebookIcon },
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, Icon: WhatsAppIcon },
  ];
  const cls = "grid size-10 place-items-center rounded-full border border-line-strong text-muted transition-all hover:-translate-y-0.5 hover:border-brand hover:text-brand-ink";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-subtle">Share</span>
      {links.map(({ label, href, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={cls}>
          <Icon className="size-4" />
        </a>
      ))}
      <button
        type="button"
        aria-label="Copy link"
        className={cls}
        onClick={async () => {
          await navigator.clipboard?.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check className="size-4 text-emerald-500" /> : <Link2 className="size-4" />}
      </button>
    </div>
  );
}
