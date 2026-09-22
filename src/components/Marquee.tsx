import { MARQUEE } from "../data/site";

/** Infinite ticker strip. The list is duplicated so the loop has no visible seam. */
export function Marquee() {
  const items = [...MARQUEE, ...MARQUEE];

  return (
    <div className="relative z-10 overflow-hidden border-y border-hair py-4">
      <div className="marquee-track">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="hud flex shrink-0 items-center gap-8 px-8 text-faint"
          >
            {item}
            {/* Slash separator, matching the {CITY/} bracket convention used
                across the HUD labels — not a decorative glyph. */}
            <span aria-hidden="true">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
