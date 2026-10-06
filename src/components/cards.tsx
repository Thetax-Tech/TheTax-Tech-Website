import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { TiltCard } from "@/components/motion/tilt-card";
import { CoverArt } from "@/components/ui/cover-art";
import type { PostVM, ProjectVM, ServiceVM } from "@/lib/data";
import { cn, formatDate } from "@/lib/utils";

export function ServiceCard({ service, index, large }: { service: Pick<ServiceVM, "slug" | "name" | "icon" | "tagline" | "shortDescription">; index?: number; large?: boolean }) {
  return (
    <TiltCard className="card h-full overflow-hidden" max={5}>
      <Link href={`/services/${service.slug}`} className="flex h-full flex-col p-7 sm:p-8">
        <div className="flex items-start justify-between">
          <span className="grid size-14 place-items-center rounded-2xl border border-line bg-surface-2 text-brand-ink transition-all duration-500 group-hover:rotate-[-6deg] group-hover:scale-110 group-hover:border-brand group-hover:bg-brand group-hover:text-on-brand">
            <Icon name={service.icon} className="size-6" />
          </span>
          {typeof index === "number" && <span className="font-display text-sm text-subtle">{String(index + 1).padStart(2, "0")}</span>}
        </div>
        <h3 className={cn("mt-8 font-semibold", large ? "text-2xl sm:text-3xl" : "text-xl")}>{service.name}</h3>
        {service.tagline && <p className="mt-2 text-sm font-medium text-brand-ink">{service.tagline}</p>}
        <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">{service.shortDescription}</p>
        <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">
          Learn more
          <span className="grid size-8 place-items-center rounded-full border border-line-strong transition-all duration-300 group-hover:rotate-45 group-hover:border-brand group-hover:bg-brand group-hover:text-on-brand">
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </span>
      </Link>
    </TiltCard>
  );
}

export function SampleBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur", className)} title="Concept case study created to show our approach — not a real client project">
      Sample project
    </span>
  );
}

export function ProjectCard({ project, priority, className, sampleBadge }: { project: ProjectVM; priority?: boolean; className?: string; sampleBadge?: boolean }) {
  return (
    <article className={cn("group relative", className)}>
      <Link href={`/portfolio/${project.slug}`} className="block" data-cursor="View">
        <div className="relative overflow-hidden rounded-3xl border border-line">
          <CoverArt src={project.coverImage} hoverSrc={project.gallery[0]} alt={project.title} seed={project.slug} label={project.coverImage ? undefined : project.category} className="aspect-[4/3]" priority={priority} />
          <span className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-white backdrop-blur">{project.category}</span>
            {sampleBadge && project.isSample && <SampleBadge />}
          </span>
          <span className="absolute right-5 top-5 grid size-11 translate-y-2 place-items-center rounded-full bg-brand text-on-brand opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="size-5" aria-hidden />
          </span>
        </div>
        <div className="mt-5 flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-subtle">
          <span>{project.industry}</span>
          {project.year && (
            <>
              <span className="size-1 rounded-full bg-brand" />
              <span>{project.year}</span>
            </>
          )}
        </div>
        <h3 className="mt-2 text-xl font-semibold leading-snug transition-colors group-hover:text-brand-ink sm:text-2xl">{project.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-2">{project.summary}</p>
      </Link>
    </article>
  );
}

export function PostCard({ post, priority, className }: { post: PostVM; priority?: boolean; className?: string }) {
  return (
    <article className={cn("group card flex h-full flex-col overflow-hidden", className)}>
      <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
        <CoverArt src={post.coverImage} alt={post.coverAlt || post.title} seed={post.slug} label={post.coverImage ? undefined : post.category?.name} className="aspect-[1200/630]" priority={priority} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" />
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-3 text-xs text-subtle">
            <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
            <span className="size-1 rounded-full bg-brand" />
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" aria-hidden /> {post.readingTime} min read
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold leading-snug transition-colors group-hover:text-brand-ink">{post.title}</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted line-clamp-3">{post.excerpt}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
            Read article <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </span>
        </div>
      </Link>
    </article>
  );
}
