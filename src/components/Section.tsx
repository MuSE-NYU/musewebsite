import type { ReactNode } from "react";

/** The bracketed index + name that heads every section. */
export function SectionLabel({
  index,
  title,
  meta,
}: {
  index: string;
  title: string;
  meta?: string;
}) {
  return (
    <div className="mb-12 flex items-baseline justify-between gap-6 border-b border-hair pb-4 md:mb-16">
      <div className="hud flex items-baseline gap-4 text-dim">
        <span className="text-accent">
          {"{"}
          {index}
          {"}"}
        </span>
        <span className="text-ink">{title}</span>
      </div>
      {meta ? <span className="hud-sm hidden text-faint sm:block">{meta}</span> : null}
    </div>
  );
}

/** Shared section shell: full-height, padded, above the canvas. */
export function Section({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative z-10 px-5 py-28 md:px-8 md:py-36 ${className}`}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}
