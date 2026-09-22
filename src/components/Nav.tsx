import { useEffect, useState } from "react";

import {
  disableMic,
  enableMic,
  getSource,
  onSourceChange,
  type AudioSource,
} from "../lib/audio";
import { useActiveSection } from "../lib/hooks";
import { NAV, SITE } from "../data/site";

const NAV_IDS = NAV.map((item) => item.id);

/**
 * SOUND ON/OFF. "ON" hands the visualiser a live mic feed; "OFF" falls back to
 * the synthetic envelope. If the browser denies the mic we silently stay off.
 */
function SoundToggle() {
  const [source, setSource] = useState<AudioSource>(getSource);
  const [pending, setPending] = useState(false);

  useEffect(() => onSourceChange(setSource), []);

  const turnOn = async () => {
    if (source === "mic" || pending) return;
    setPending(true);
    await enableMic();
    setPending(false);
  };

  return (
    <div className="hud-sm flex items-center gap-2 text-faint">
      <span className="hidden sm:inline">{"{Sound}"}</span>
      <button
        type="button"
        onClick={turnOn}
        aria-pressed={source === "mic"}
        className={`transition-colors duration-300 hover:text-ink ${
          source === "mic" ? "text-accent" : "text-dim"
        }`}
      >
        {pending ? "···" : "On"}
      </button>
      <button
        type="button"
        onClick={disableMic}
        aria-pressed={source === "synthetic"}
        className={`transition-colors duration-300 hover:text-ink ${
          source === "synthetic" ? "text-accent" : "text-dim"
        }`}
      >
        Off
      </button>
    </div>
  );
}

function Wordmark() {
  return (
    <a
      href="#index"
      className="group flex flex-col items-center leading-none"
      aria-label={`${SITE.short} — home`}
    >
      <span
        className="glitch display text-[1.35rem] tracking-[-0.06em] text-ink"
        data-text={SITE.short}
      >
        {SITE.short}
      </span>
      <span className="hud-sm mt-1 text-faint transition-colors duration-300 group-hover:text-accent">
        @ NYU
      </span>
    </a>
  );
}

export function Nav() {
  const active = useActiveSection(NAV_IDS);
  const [open, setOpen] = useState(false);

  // Lock the page while the mobile menu is up.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        {/* Scrim so section headings scrolling underneath don't collide with
            the nav labels. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-void via-void/85 to-transparent"
        />

        {/* Three tracks so the wordmark stays optically centred regardless of
            how wide the clusters either side of it get. */}
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-start gap-4 px-5 py-5 md:px-8 md:py-6">
          <div className="flex items-start gap-8">
            <div className="hud-sm hidden text-dim lg:block">
              {"{"}
              {SITE.full}.
              <br />
              Student collective{"}"}
            </div>

            {/* "Join" is omitted here — the accent button opposite is the CTA. */}
            <nav className="hidden items-center gap-7 md:flex">
              {NAV.filter((item) => item.id !== "join").map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`hud-sm link-hud ${
                    active === item.id ? "is-active" : ""
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <Wordmark />

          <div className="flex items-start justify-end gap-4 md:gap-6">
            <div className="hud-sm hidden text-right text-dim xl:block">
              {"{"}
              {SITE.city}/{"}"}
              <br />
              {"{"}
              {SITE.country}
              {"}"}
            </div>

            {/* Below sm the {Sound} caption drops out and a bare "On Off"
                beside "Menu" is unreadable — it lives in the menu instead. */}
            <div className="hidden sm:block">
              <SoundToggle />
            </div>

            <a
              href={SITE.discord}
              target="_blank"
              rel="noreferrer"
              className="hud-sm hidden bg-accent px-2.5 py-1 text-black transition-opacity duration-300 hover:opacity-70 sm:inline-block"
            >
              Join
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Toggle menu"
              className="hud-sm text-dim transition-colors hover:text-ink md:hidden"
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 bg-void/95 backdrop-blur-sm transition-opacity duration-500 md:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex h-full flex-col justify-center gap-2 px-6">
          {NAV.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              className="display border-b border-hair py-4 text-5xl uppercase text-ink transition-colors duration-300 hover:text-accent"
            >
              <span className="hud-sm mr-4 align-middle text-faint">
                0{i + 1}
              </span>
              {item.label}
            </a>
          ))}

          <div className="mt-8 flex items-center justify-between">
            {/* SoundToggle hides its own caption below sm, so supply one here.
                Above sm it prints its own and this would duplicate. */}
            <span className="hud-sm text-faint sm:hidden">{"{Sound}"}</span>
            <SoundToggle />
          </div>

          <a
            href={SITE.discord}
            target="_blank"
            rel="noreferrer"
            className="hud mt-6 bg-accent px-4 py-3 text-center text-black"
          >
            Join the Discord
          </a>
        </nav>
      </div>
    </>
  );
}
