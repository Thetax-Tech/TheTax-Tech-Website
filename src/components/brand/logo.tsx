import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Official horizontal wordmark. Dark text version for light theme and white text version for
 * dark theme — swapped with CSS so there is no hydration flash.
 * Custom logos uploaded in Admin → Settings override the defaults.
 */
export function Logo({
  className,
  logo = "/brand/logo-horizontal-sm.png",
  logoDark = "/brand/logo-horizontal-white-sm.png",
  name = "Theta X Tech",
  priority,
}: {
  className?: string;
  logo?: string;
  logoDark?: string;
  name?: string;
  priority?: boolean;
}) {
  return (
    <Link href="/" aria-label={`${name} — home`} className={cn("relative block h-8 w-[180px] shrink-0 sm:h-9 sm:w-[200px]", className)}>
      <Image src={logo} alt={name} fill sizes="200px" priority={priority} className="object-contain object-left dark:hidden" />
      <Image src={logoDark} alt={name} fill sizes="200px" priority={priority} className="hidden object-contain object-left dark:block" />
    </Link>
  );
}
