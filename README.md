# MuSE @ NYU

Homepage for MuSE (Music and Sound Engineering) at New York University.

Dark, CRT-flavoured parallax site with a WebGL audio visualiser behind the
content. React 19 + Vite + Tailwind v4 + three.js (react-three-fiber).

```bash
yarn dev      # dev server
yarn build    # typecheck + production build to dist/
yarn lint
```

## Edit this first

Everything club-specific lives in **`src/data/site.ts`** — no need to touch
components for routine updates:

| What | Where |
| --- | --- |
| Discord invite, email, Instagram | `SITE` (marked with a `TODO(muse)`) |
| Project roster | `PROJECTS` |
| What-we-do cards | `PILLARS` |
| Meeting time, room, dues | `PRACTICALS` (has a `TODO(muse)`) |
| How-to-join steps | `STEPS` |
| Ticker words | `MARQUEE` |

The Discord link is a **placeholder** (`discord.gg/your-invite-code`). Replace it
before sharing the site — it appears in the nav, hero, join section and footer.

## Structure

```
src/
  data/site.ts        all copy + links
  lib/
    view.ts           single rAF loop: scroll, pointer, DOM parallax layers
    audio.ts          visualiser signal (synthetic by default, mic on demand)
    hooks.ts          reveal-on-scroll, parallax, active-section
  three/
    Scene.tsx         the <Canvas>, camera rig, hero lift
    Core.tsx          the visualiser orb (noise-displaced point cloud)
    Streaks.tsx       light-trail fans
    Particles.tsx     scroll-coupled particle field
    Grid.tsx          horizon grid
    Effects.tsx       bloom / chromatic aberration / noise / vignette
    glsl.ts           simplex noise + the `track()` keyframe helper
  components/         nav, sections, CRT overlay, spectrum readout
```

### How the motion works

One `requestAnimationFrame` loop in `lib/view.ts` owns scroll and pointer state
and writes it to a plain mutable object. Both the DOM parallax layers and every
three.js `useFrame` callback read from it, so scrolling never triggers a React
re-render.

Scene choreography is keyframed against scroll progress with `track()` in
`three/glsl.ts`:

```ts
// 1 at the top of the page, 0.62 at 30% scroll, 0.34 at 62%, …
const scale = track(progress, [[0, 1], [0.3, 0.62], [0.62, 0.34], [1, 0.92]]);
```

Adjust those arrays to re-stage how the orb moves between sections.

### Audio

`SOUND → ON` in the nav asks for mic permission and drives the visualiser from a
live `AnalyserNode`. With it off (the default) the same interface is fed by a
synthetic ~118bpm envelope, so the geometry still breathes and nothing prompts
the visitor. Both the 3D scene and the DOM spectrum bars read the same source.

### Notes

- `react/immutability` is disabled for `src/three/**` in `.oxlintrc.json`.
  Mutating uniforms and the camera inside `useFrame` is the intended
  react-three-fiber pattern; the rule assumes React's render model.
- `prefers-reduced-motion` is respected: parallax, TV static, marquee, glitch
  and reveal transitions all stand down.
