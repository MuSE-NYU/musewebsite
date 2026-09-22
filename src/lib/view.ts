/**
 * A single rAF loop that owns scroll + pointer state.
 *
 * Everything that animates (the three.js scene, DOM parallax layers) reads from
 * the mutable `view` object rather than React state, so scrolling never triggers
 * a re-render.
 */

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Maps `v` from [inMin,inMax] to [0,1], clamped. */
export const range = (v: number, inMin: number, inMax: number) =>
  clamp((v - inMin) / (inMax - inMin || 1), 0, 1);

export const view = {
  /** Raw window.scrollY in px. */
  scrollY: 0,
  /** Eased scrollY — what the parallax layers follow. */
  smoothY: 0,
  /** 0..1 across the whole document. */
  progress: 0,
  /** Eased document progress. */
  smoothProgress: 0,
  /** Smoothed px/frame scroll delta — signed. */
  velocity: 0,
  /** Pointer in normalised device coords, -1..1. */
  pointerX: 0,
  pointerY: 0,
  smoothPointerX: 0,
  smoothPointerY: 0,
  /** Viewport height, cached. */
  height: 0,
  reducedMotion: false,
};

type Layer = {
  el: HTMLElement;
  speed: number;
  /** Cached document offset of the element's centre. */
  centre: number;
  height: number;
};

const layers = new Set<Layer>();

function measure(layer: Layer) {
  const rect = layer.el.getBoundingClientRect();
  // Undo any transform we already applied so the measurement is the layout
  // position, not the animated one.
  const applied = Number(layer.el.dataset.parallaxOffset ?? 0);
  layer.centre = rect.top + window.scrollY - applied + rect.height / 2;
  layer.height = rect.height;
}

/**
 * Registers an element as a parallax layer.
 * `speed` is in viewport-height units: 0.1 means the element drifts by 10% of
 * the viewport height across a full screen of scrolling. Negative moves against
 * the scroll direction.
 */
export function registerLayer(el: HTMLElement, speed: number) {
  const layer: Layer = { el, speed, centre: 0, height: 0 };
  measure(layer);
  layers.add(layer);
  return () => {
    layers.delete(layer);
    el.style.transform = "";
    delete el.dataset.parallaxOffset;
  };
}

function remeasureAll() {
  view.height = window.innerHeight;
  layers.forEach(measure);
}

let rafId = 0;
let started = false;

function onScroll() {
  view.scrollY = window.scrollY;
}

function onPointerMove(e: PointerEvent) {
  view.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
  view.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
}

function frame() {
  rafId = requestAnimationFrame(frame);

  const maxScroll = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );

  const previous = view.smoothY;
  const ease = view.reducedMotion ? 1 : 0.11;

  view.smoothY = lerp(view.smoothY, view.scrollY, ease);
  view.velocity = view.smoothY - previous;
  view.progress = clamp(view.scrollY / maxScroll, 0, 1);
  view.smoothProgress = clamp(view.smoothY / maxScroll, 0, 1);

  view.smoothPointerX = lerp(view.smoothPointerX, view.pointerX, 0.06);
  view.smoothPointerY = lerp(view.smoothPointerY, view.pointerY, 0.06);

  if (!view.reducedMotion) {
    const half = view.height / 2;
    for (const layer of layers) {
      // Where the element's centre sits relative to the viewport centre,
      // expressed in viewport heights.
      const relative = (layer.centre - view.smoothY - half) / view.height;
      const offset = relative * layer.speed * view.height;
      layer.el.dataset.parallaxOffset = String(offset);
      layer.el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    }
  }
}

export function startViewLoop() {
  if (started) return () => {};
  started = true;

  view.reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  view.height = window.innerHeight;
  view.scrollY = window.scrollY;
  view.smoothY = window.scrollY;

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", remeasureAll);
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  // Fonts and images shift layout; re-measure once things settle.
  const settle = window.setTimeout(remeasureAll, 600);
  document.fonts?.ready.then(remeasureAll).catch(() => {});

  rafId = requestAnimationFrame(frame);

  return () => {
    started = false;
    cancelAnimationFrame(rafId);
    window.clearTimeout(settle);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", remeasureAll);
    window.removeEventListener("pointermove", onPointerMove);
  };
}
