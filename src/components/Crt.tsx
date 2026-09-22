import { useEffect, useRef } from "react";

/**
 * Animated TV static. A small offscreen buffer of random luminance is redrawn
 * ~14 times a second and stretched over the viewport with pixelated scaling —
 * the same trick an old tuner does when it loses the signal, and far cheaper
 * than an SVG turbulence filter.
 */
function TvNoise() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const W = 180;
    const H = 130;
    canvas.width = W;
    canvas.height = H;

    const image = ctx.createImageData(W, H);
    const pixels = new Uint32Array(image.data.buffer);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fps = reduced ? 0 : 14;

    const paint = () => {
      for (let i = 0; i < pixels.length; i++) {
        const v = (Math.random() * 255) | 0;
        // Little-endian ABGR packing.
        pixels[i] = (255 << 24) | (v << 16) | (v << 8) | v;
      }
      ctx.putImageData(image, 0, 0);
    };

    paint();
    if (!fps) return;

    let raf = 0;
    let last = 0;
    const interval = 1000 / fps;

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (time - last < interval) return;
      last = time;
      paint();
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="crt-layer h-full w-full opacity-[0.045] mix-blend-screen"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

/** The full overlay stack: static, scanlines, roll bar, flicker, vignette. */
export function Crt() {
  return (
    <>
      <TvNoise />
      <div aria-hidden="true" className="crt-layer crt-scanlines" />
      <div aria-hidden="true" className="crt-layer overflow-hidden">
        <div className="crt-rollbar w-full" />
      </div>
      <div aria-hidden="true" className="crt-layer crt-flicker" />
      <div aria-hidden="true" className="crt-layer crt-vignette" />
    </>
  );
}
