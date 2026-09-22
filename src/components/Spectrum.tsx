import { useEffect, useRef } from "react";

import { getSpectrum } from "../lib/audio";

/**
 * A small DOM spectrum readout. Reads the same analyser the 3D scene does, so
 * the bars and the geometry always agree. Animated by mutating transforms
 * directly — no React state per frame.
 */
export function Spectrum({ bars = 12 }: { bars?: number }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = container.current;
    if (!el) return;

    const children = Array.from(el.children) as HTMLElement[];
    let raf = 0;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const spectrum = getSpectrum();

      for (let i = 0; i < children.length; i++) {
        const value = spectrum[i % spectrum.length] ?? 0;
        children[i].style.transform = `scaleY(${(0.08 + value * 0.92).toFixed(3)})`;
      }
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [bars]);

  return (
    <div
      ref={container}
      aria-hidden="true"
      className="flex h-6 items-end gap-[3px]"
    >
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className="h-full w-[2px] origin-bottom bg-ink/45"
          style={{ transform: "scaleY(0.1)" }}
        />
      ))}
    </div>
  );
}
