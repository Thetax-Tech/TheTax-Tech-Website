"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/** Toggles data-theme on <html> and remembers the choice. Icons swap via CSS (no hydration mismatch). */
export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    const apply = () => {
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch {}
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) doc.startViewTransition(apply);
    else apply();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark theme"
      className={cn(
        "grid size-10 place-items-center rounded-full border border-line text-fg transition-colors hover:border-brand hover:text-brand-ink",
        className,
      )}
    >
      <Sun className="hidden size-[18px] dark:block" aria-hidden />
      <Moon className="block size-[18px] dark:hidden" aria-hidden />
    </button>
  );
}
