import { useReveal } from "../lib/hooks";
import { SITE, STEPS } from "../data/site";
import { Section, SectionLabel } from "./Section";
import { Spectrum } from "./Spectrum";

export function Join() {
  const heading = useReveal<HTMLDivElement>();
  const steps = useReveal<HTMLDivElement>(0.15);

  return (
    <Section id="join">
      <SectionLabel index="03" title="Join" meta="Open to all NYU students" />

      <div ref={heading} className="reveal">
        <h2 className="display uppercase text-[14vw] leading-[0.82] text-ink md:text-[8rem] lg:text-[10rem]">
          Come make
          <br />
          <span className="text-accent">noise</span>
        </h2>

        <div className="mt-10 grid gap-10 border-t border-hair pt-10 md:grid-cols-12 md:gap-16">
          <p className="hud text-dim md:col-span-4">{"{"}No audition{"}"}</p>

          <div className="md:col-span-8">
            <p className="legible max-w-2xl text-sm leading-relaxed text-dim md:text-base">
              You don&apos;t need gear, a portfolio, or a single finished track.
              Bring whatever you&apos;ve got — a folder of unfinished loops, a
              soldering iron, a very specific opinion about tape saturation —
              and we&apos;ll find you something to work on.
            </p>

            <a
              href={SITE.discord}
              target="_blank"
              rel="noreferrer"
              className="hud group mt-10 flex w-full items-center justify-between gap-6 bg-accent px-6 py-5 text-black transition-opacity duration-300 hover:opacity-75 sm:w-auto sm:min-w-[22rem]"
            >
              <span>Join the Discord</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                →
              </span>
            </a>

            <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
              <a
                href={`mailto:${SITE.email}`}
                className="hud-sm link-hud"
              >
                {SITE.email}
              </a>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noreferrer"
                className="hud-sm link-hud"
              >
                Instagram
              </a>
              <Spectrum bars={8} />
            </div>
          </div>
        </div>
      </div>

      <div
        ref={steps}
        className="reveal-stagger mt-20 grid gap-px border border-hair bg-hair md:grid-cols-3"
      >
        {STEPS.map((step) => (
          <article key={step.index} className="bg-void p-7 md:p-9">
            <div className="hud-sm mb-6 text-accent">
              {"{"}
              {step.index}
              {"}"}
            </div>
            <h3 className="display mb-3 text-2xl uppercase text-ink">{step.title}</h3>
            <p className="text-sm leading-relaxed text-dim">{step.body}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
