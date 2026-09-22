import { NAV, SITE } from "../data/site";

export function Footer() {
  return (
    <footer className="relative z-10 px-5 pb-10 pt-20 md:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-10 border-t border-hair pt-10 md:flex-row md:justify-between">
          <div>
            <div className="display text-4xl text-ink md:text-5xl">
              {SITE.short}
            </div>
            <div className="hud-sm mt-3 max-w-xs text-faint">
              {"{"}
              {SITE.full} — {SITE.org}
              {"}"}
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {NAV.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="hud-sm link-hud">
                {item.label}
              </a>
            ))}
          </nav>

          <nav className="flex flex-col gap-2">
            <a
              href={SITE.discord}
              target="_blank"
              rel="noreferrer"
              className="hud-sm link-hud"
            >
              Discord
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noreferrer"
              className="hud-sm link-hud"
            >
              Instagram
            </a>
            <a href={`mailto:${SITE.email}`} className="hud-sm link-hud">
              Email
            </a>
          </nav>
        </div>

        <div className="hud-sm mt-14 flex flex-col gap-2 text-faint sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} {SITE.short} @ NYU
          </span>
          <span>{SITE.coords}</span>
        </div>
      </div>
    </footer>
  );
}
