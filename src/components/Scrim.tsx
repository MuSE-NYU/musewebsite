import { useEffect, useRef } from "react";

import { clamp, view } from "../lib/view";

/**
 * A scroll-driven dimmer between the 3D scene and the page copy.
 *
 * It stays fully transparent through the hero so the geometry reads at full
 * strength, then fades in over the first screen of scrolling to keep body text
 * legible against the brighter streaks below.
 */
export function Scrim() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let current = -1;

    const loop = () => {
      raf = requestAnimationFrame(loop);

      const next = clamp(view.smoothY / Math.max(view.height * 0.75, 1), 0, 1);
      // Only touch the DOM when it actually changes.
      if (Math.abs(next - current) < 0.002) return;

      current = next;
      el.style.opacity = next.toFixed(3);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-void/50 via-void/65 to-void/80"
      style={{ opacity: 0 }}
    />
  );
}
