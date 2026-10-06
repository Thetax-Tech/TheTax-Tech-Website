import { Logo } from "@/components/brand/logo";
import { LOGO_PATHS } from "@/components/brand/logo-mark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-line bg-bg-elevated lg:block">
        <div aria-hidden className="absolute inset-0 bg-grid mask-radial" />
        <div aria-hidden className="absolute left-1/2 top-1/2 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full blob [--blob-a:44%]" />
        <svg viewBox="0 0 1430 1317" aria-hidden className="absolute left-1/2 top-1/2 w-72 -translate-x-1/2 -translate-y-1/2 animate-float">
          <path d={LOGO_PATHS.ring} fill="var(--brand)" />
          <path d={LOGO_PATHS.wingTop} fill="var(--brand)" />
          <path d={LOGO_PATHS.wingMid} className="fill-fg" />
        </svg>
        <p className="absolute inset-x-0 bottom-10 text-center text-sm text-subtle">Theta X Tech — Content management</p>
      </div>
      <main className="flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Logo className="mb-10" />
          {children}
        </div>
      </main>
    </div>
  );
}
