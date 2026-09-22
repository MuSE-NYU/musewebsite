import { useParallax, useReveal } from "../lib/hooks";
import { PILLARS, PRACTICALS } from "../data/site";
import { Section, SectionLabel } from "./Section";

export function About() {
  const heading = useReveal<HTMLDivElement>();
  const pillars = useReveal<HTMLDivElement>(0.1);
  const stats = useReveal<HTMLDivElement>(0.3);
  const drift = useParallax<HTMLDivElement>(-0.08);

  return (
    <Section id="about">
      <SectionLabel index="01" title="About" meta="Who we are" />

      <div ref={heading} className="reveal">
        <div ref={drift}>
          <h2 className="display max-w-4xl uppercase text-[11vw] text-ink md:text-[5.5rem] lg:text-[6.5rem]">
            We build the
            <br />
            <span className="text-accent">signal chain</span>
          </h2>
        </div>

        <div className="mt-10 grid gap-10 border-t border-hair pt-10 md:grid-cols-12 md:gap-16">
          <p className="hud text-dim md:col-span-4">
            {"{"}What we actually do{"}"}
          </p>

          <div className="legible space-y-5 text-sm leading-relaxed text-dim md:col-span-8 md:text-base">
            <p>
              MuSE started because the gap between{" "}
              <span className="text-ink">making music</span> and{" "}
              <span className="text-ink">making the tools that make music</span>{" "}
              is smaller than most people think. Which compressor you reach for
              is as much a creative decision as the take you put through it.
            </p>
            <p>
              So we treat the whole chain as one subject — from the mic in front
              of the amp, through the converters and the code, to the PA at the
              back of a room in the East Village. Some weeks that means a
              tracking session. Some weeks it means debugging a filter that
              keeps blowing up at high Q.
            </p>
            <p>
              There&apos;s no audition and no prerequisite. Plenty of members
              turned up without knowing what a Nyquist frequency was, and
              figured it out on a Thursday evening like everyone else.
            </p>
          </div>
        </div>
      </div>

      <div
        ref={pillars}
        className="reveal-stagger mt-20 grid gap-px border border-hair bg-hair sm:grid-cols-2"
      >
        {PILLARS.map((pillar) => (
          <article
            key={pillar.id}
            className="group bg-void p-7 transition-colors duration-500 hover:bg-panel md:p-9"
          >
            <div className="hud-sm mb-5 flex items-center justify-between text-faint">
              <span className="transition-colors duration-500 group-hover:text-accent">
                {"{"}
                {pillar.id}
                {"}"}
              </span>
              <span className="h-px w-8 bg-hair transition-all duration-500 group-hover:w-16 group-hover:bg-accent" />
            </div>

            <h3 className="display mb-3 text-2xl uppercase text-ink md:text-3xl">
              {pillar.title}
            </h3>

            <p className="text-sm leading-relaxed text-dim">{pillar.body}</p>
          </article>
        ))}
      </div>

      <div ref={stats} className="reveal mt-20">
        <div className="hud-sm mb-5 text-faint">{"{Practicals}"}</div>

        <dl className="border-t border-hair">
          {PRACTICALS.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-1 border-b border-hair py-4 sm:flex-row sm:items-baseline sm:gap-8"
            >
              <dt className="hud-sm w-40 shrink-0 text-faint">{row.label}</dt>
              <dd className="text-sm text-ink md:text-base">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
