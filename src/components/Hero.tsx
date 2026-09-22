import { useParallax } from "../lib/hooks";
import { SITE } from "../data/site";
import { Spectrum } from "./Spectrum";

export function Hero() {
  // Negative speeds lag behind the scroll, so the wordmark sinks slower than
  // the copy beneath it and the layers separate as you leave the section.
  const eyebrow = useParallax<HTMLDivElement>(-0.06);
  const wordmark = useParallax<HTMLDivElement>(-0.2);
  const body = useParallax<HTMLDivElement>(-0.1);
  const footer = useParallax<HTMLDivElement>(-0.03);

  return (
    <section
      id="index"
      className="relative z-10 flex min-h-screen flex-col justify-between px-5 pb-8 pt-28 md:px-8 md:pb-10 md:pt-32"
    >
      <div ref={eyebrow} className="hud-sm legible flex justify-between text-faint">
        <span>
          {"{"}Est. {SITE.established}
          {"}"}
        </span>
        <span className="hidden sm:inline">{SITE.org}</span>
      </div>

      <div className="flex flex-col items-start">
        <div ref={wordmark} className="w-full">
          <h1
            className="glitch display w-full text-[26vw] leading-[0.78] text-ink md:text-[20vw]"
            data-text={SITE.short}
          >
            {SITE.short}
          </h1>
        </div>

        <div
          ref={body}
          className="mt-6 flex w-full flex-col gap-8 border-t border-hair pt-6 md:mt-8 md:flex-row md:items-start md:justify-between md:gap-16"
        >
          <p className="hud legible max-w-md text-dim">
            {"{"}Music and Sound Engineering — a student collective at New York
            University{"}"}
          </p>

          <p className="legible max-w-lg text-sm leading-relaxed text-dim md:text-base">
            We build instruments, write the code that shapes them, run the
            boards at campus shows, and argue about reverb tails until 3am.
            Producers, engineers, DSP obsessives, and people who just like
            listening closely.
          </p>

          <div className="flex shrink-0 flex-col gap-3">
            <a
              href={SITE.discord}
              target="_blank"
              rel="noreferrer"
              className="hud group flex items-center justify-between gap-6 bg-accent px-4 py-3 text-black transition-opacity duration-300 hover:opacity-75"
            >
              Join the Discord
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>

            {/* Deliberately not a second button — one CTA, one text link,
                so the hierarchy is unambiguous. */}
            <a href="#projects" className="hud link-hud self-start">
              See what we&apos;re building
            </a>
          </div>
        </div>
      </div>

      <div
        ref={footer}
        className="hud-sm legible flex items-end justify-between gap-6 text-dim"
      >
        <div className="flex items-end gap-5">
          <span className="animate-pulse">Scroll</span>
          <Spectrum />
        </div>
        <span className="hidden text-right md:block">{SITE.coords}</span>
      </div>
    </section>
  );
}
