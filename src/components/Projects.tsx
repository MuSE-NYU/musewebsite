import { useParallax, useReveal } from "../lib/hooks";
import { PROJECTS } from "../data/site";
import { Section, SectionLabel } from "./Section";

export function Projects() {
  const heading = useReveal<HTMLDivElement>();
  const list = useReveal<HTMLDivElement>(0.05);
  const drift = useParallax<HTMLDivElement>(-0.06);

  return (
    <Section id="projects">
      <SectionLabel
        index="02"
        title="Projects"
        meta={`${PROJECTS.length} entries — updated each semester`}
      />

      <div ref={heading} className="reveal">
        <div ref={drift} className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="display uppercase text-[11vw] text-ink md:text-[5.5rem] lg:text-[6.5rem]">
            What we&apos;re
            <br />
            building
          </h2>

          <p className="hud max-w-xs text-dim">
            {"{"}Everything here is member-led. Pick one, or bring your own
            {"}"}
          </p>
        </div>
      </div>

      <div ref={list} className="reveal-stagger mt-16 border-t border-hair">
        {PROJECTS.map((project) => (
          <article
            key={project.index}
            className="group relative grid cursor-default gap-4 border-b border-hair py-8 transition-colors duration-500 hover:bg-panel md:grid-cols-12 md:items-baseline md:gap-8 md:px-4"
          >
            {/* Accent rule that wipes in on hover */}
            <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />

            <div className="hud-sm text-faint md:col-span-1">
              {"{"}
              {project.index}
              {"}"}
            </div>

            <h3 className="display text-3xl uppercase text-ink transition-colors duration-500 group-hover:text-accent md:col-span-3 md:text-4xl">
              {project.title}
            </h3>

            <p className="legible text-sm leading-relaxed text-dim md:col-span-5">
              {project.body}
            </p>

            <div className="hud-sm flex gap-4 text-faint md:col-span-3 md:flex-col md:items-end md:gap-1 md:text-right">
              <span className="text-dim">{project.tag}</span>
              <span>{project.year}</span>
              <span className="text-accent">{project.status}</span>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
