import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { getBeat, getLevel } from "../lib/audio";
import { view } from "../lib/view";

/**
 * Scroll-coupled particle field.
 *
 * Each particle carries a depth-derived speed, so scrolling pushes near
 * particles further than far ones and the field reads as real depth rather
 * than a flat starfield. Positions wrap in the shader — nothing is ever
 * recycled on the CPU.
 */

const COUNT = 4200;
const FIELD_X = 34;
const FIELD_Y = 30;
const FIELD_Z = 26;

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uAudio;
  uniform float uPointerX;
  uniform float uPointerY;
  uniform float uSize;

  attribute float aSpeed;
  attribute float aScale;
  attribute float aSeed;

  varying float vFade;
  varying float vSeed;

  void main() {
    vec3 p = position;

    // Scroll drives the field downward; nearer particles (higher aSpeed) move
    // more. Plus a slow idle drift so it never fully stops.
    p.y -= uScroll * aSpeed + uTime * 0.25 * aSpeed;

    // Wrap into the field box.
    float span = ${FIELD_Y.toFixed(1)};
    p.y = mod(p.y + span * 0.5, span) - span * 0.5;

    // Gentle lateral sway, and a parallax nudge from the cursor.
    p.x += sin(uTime * 0.25 + aSeed * 6.283) * 0.35;
    p.x += uPointerX * aSpeed * 1.6;
    p.y += uPointerY * aSpeed * 1.0;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);

    float dist = -mv.z;
    vFade = 1.0 - smoothstep(6.0, 46.0, dist);
    vSeed = aSeed;

    gl_PointSize = uSize * aScale * (1.0 + uAudio * 0.5) * (18.0 / max(dist, 0.1));
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform vec3 uAccent;

  varying float vFade;
  varying float vSeed;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float sprite = 1.0 - smoothstep(0.05, 0.5, d);

    // A small minority burn accent-orange; the rest stay white.
    vec3 color = mix(uColor, uAccent, step(0.93, vSeed));

    // Slow asynchronous twinkle.
    float twinkle = 0.65 + 0.35 * sin(uTime * 1.4 + vSeed * 30.0);

    gl_FragColor = vec4(color, sprite * vFade * twinkle * uOpacity);
  }
`;

export function Particles() {
  const geometry = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    const scales = new Float32Array(COUNT);
    const seeds = new Float32Array(COUNT);

    // Deterministic hash instead of Math.random so the field is stable across
    // reloads and hot updates.
    const hash = (n: number) => {
      const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
      return v - Math.floor(v);
    };

    for (let i = 0; i < COUNT; i++) {
      const depth = hash(i * 3 + 2);

      positions[i * 3 + 0] = (hash(i * 3 + 0) - 0.5) * FIELD_X;
      positions[i * 3 + 1] = (hash(i * 3 + 1) - 0.5) * FIELD_Y;
      // Bias toward the back so the foreground stays readable.
      positions[i * 3 + 2] = -depth * depth * FIELD_Z - 1;

      // Near particles travel fastest.
      speeds[i] = 0.35 + (1 - depth) * 1.5;
      scales[i] = 0.4 + hash(i * 7 + 5) * 0.85;
      seeds[i] = hash(i * 11 + 13);
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    g.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uAudio: { value: 0 },
      uPointerX: { value: 0 },
      uPointerY: { value: 0 },
      uSize: { value: 1.15 },
      uOpacity: { value: 0.5 },
      uColor: { value: new THREE.Color("#ffffff") },
      uAccent: { value: new THREE.Color("#ff4d00") },
    }),
    [],
  );

  const points = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);

    uniforms.uTime.value += dt;
    uniforms.uAudio.value = getLevel() * 0.5 + getBeat() * 0.5;

    // Scroll position in world units — this is what couples the field to the page.
    uniforms.uScroll.value = view.smoothY * 0.012;
    uniforms.uPointerX.value = view.smoothPointerX;
    uniforms.uPointerY.value = -view.smoothPointerY;

    if (points.current) {
      points.current.rotation.z = view.smoothProgress * 0.18;
    }
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
